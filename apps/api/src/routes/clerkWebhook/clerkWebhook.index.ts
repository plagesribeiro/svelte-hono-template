import { OpenAPIHono } from '@hono/zod-openapi'
import { Webhook } from 'svix'
import { clerkWebhookRoute } from './clerkWebhook.route'
import { ClerkWebhookRequestSchema } from './clerkWebhook.types'
import { Logger } from '../../utils/logger'

export const clerkWebhookRouter = new OpenAPIHono<{ Bindings: CloudflareBindings }>().openapi(clerkWebhookRoute, async (c) => {
    // 1. Verify if we have the webhook secret value
    const webhookSecret = c.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
        Logger.error('CLERK_WEBHOOK_SECRET not configured')
        return c.json({ success: false, message: 'CLERK_WEBHOOK_SECRET not configured' }, 500)
    }

    // 2. Get the raw payload and necessary headers
    const payload = await c.req.text()
    const svixId = c.req.header('svix-id')
    const svixTimestamp = c.req.header('svix-timestamp')
    const svixSignature = c.req.header('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
        Logger.error('Missing required webhook headers')
        return c.json(
            {
                success: false,
                message: 'Missing required webhook headers (svix-id, svix-timestamp, svix-signature)',
            },
            400,
        )
    }

    // 3. Verify the webhook signature using svix
    try {
        const wh = new Webhook(webhookSecret)
        const event = wh.verify(payload, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as Record<string, unknown>

        // 4. Validate the event schema
        const validatedEvent = ClerkWebhookRequestSchema.parse(event)

        Logger.info('Clerk webhook event received', { type: validatedEvent.type })

        // 5. Process the validated event
        switch (validatedEvent.type) {
            // ===== USER EVENTS =====
            case 'user.created':
            case 'user.updated': {
                const userData = validatedEvent.data
                const primaryEmail = userData.email_addresses[0]?.email_address

                if (!primaryEmail) {
                    Logger.error('No primary email found for user', { clerkUserId: userData.id })
                    return c.json({ success: false, message: 'No primary email found' }, 400)
                }

                const name =
                    `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                    userData.username ||
                    'Unnamed User'
                const username = userData.username || userData.id

                await c.var.services.users.upsertUserFromClerk({
                    clerkUserId: userData.id,
                    email: primaryEmail,
                    name,
                    username,
                })

                const action = validatedEvent.type === 'user.created' ? 'created' : 'updated'
                Logger.info(`User ${action} successfully`, { clerkUserId: userData.id })
                return c.json({
                    success: true,
                    message: `User ${action} successfully`,
                })
            }

            case 'user.deleted': {
                const userData = validatedEvent.data

                await c.var.services.users.deleteUserByClerkId(userData.id)

                Logger.info('User deleted successfully', { clerkUserId: userData.id })
                return c.json({
                    success: true,
                    message: 'User deleted successfully',
                })
            }

            // ===== ORGANIZATION EVENTS =====
            case 'organization.created':
            case 'organization.updated': {
                const orgData = validatedEvent.data
                // For organization events, we need to get the creator's user ID
                // In Clerk, the first admin is typically the creator
                // We'll use a placeholder if we can't determine the creator
                const email = `${orgData.slug}@organization.goodstream.ai`
                await c.var.services.organizations.upsertOrganizationFromClerk({
                    clerkOrganizationId: orgData.id,
                    name: orgData.name,
                    email,
                    clerkUserId: orgData.created_by,
                })

                const action = validatedEvent.type === 'organization.created' ? 'created' : 'updated'
                Logger.info(`Organization ${action} successfully`, { clerkOrganizationId: orgData.id })
                return c.json({
                    success: true,
                    message: `Organization ${action} successfully`,
                })
            }

            case 'organization.deleted': {
                const orgData = validatedEvent.data

                await c.var.services.organizations.deleteOrganizationByClerkId(orgData.id)

                Logger.info('Organization deleted successfully', { clerkOrganizationId: orgData.id })
                return c.json({
                    success: true,
                    message: 'Organization deleted successfully',
                })
            }

            // ===== ORGANIZATION MEMBERSHIP EVENTS =====
            case 'organizationMembership.created':
            case 'organizationMembership.updated': {
                const memberData = validatedEvent.data

                // Map Clerk roles to our role enum
                const role = memberData.role === 'org:admin' ? 'admin' : 'member'

                try {
                    await c.var.services.organizationMembers.upsertMember({
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                        role,
                    })

                    const action = validatedEvent.type === 'organizationMembership.created' ? 'created' : 'updated'
                    Logger.info(`Organization membership ${action} successfully`, {
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                    })
                    return c.json({
                        success: true,
                        message: `Organization membership ${action} successfully`,
                    })
                } catch (error) {
                    Logger.error('Failed to upsert organization member', {
                        error,
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                    })
                    return c.json(
                        {
                            success: false,
                            message: `Organization or user not found for Clerk IDs: ${memberData.organization.id}, ${memberData.public_user_data.user_id}`,
                        },
                        400,
                    )
                }
            }

            case 'organizationMembership.deleted': {
                const memberData = validatedEvent.data

                try {
                    await c.var.services.organizationMembers.deleteMember({
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                    })

                    Logger.info('Organization membership deleted successfully', {
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                    })
                    return c.json({
                        success: true,
                        message: 'Organization membership deleted successfully',
                    })
                } catch (error) {
                    Logger.error('Failed to delete organization member', {
                        error,
                        clerkOrganizationId: memberData.organization.id,
                        clerkUserId: memberData.public_user_data.user_id,
                    })
                    return c.json(
                        {
                            success: false,
                            message: `Organization or user not found for Clerk IDs: ${memberData.organization.id}, ${memberData.public_user_data.user_id}`,
                        },
                        400,
                    )
                }
            }

            default:
                Logger.error('Unknown event type received', { type: (validatedEvent as { type: string }).type })
                return c.json(
                    {
                        success: false,
                        message: `Unknown event type: ${(validatedEvent as { type: string }).type}`,
                    },
                    400,
                )
        }
    } catch (error) {
        Logger.error('Clerk webhook error', { error: error instanceof Error ? error.message : 'Unknown error' })

        if (error instanceof Error && error.message.includes('Invalid signature')) {
            return c.json({ success: false, message: 'Invalid webhook signature' }, 401)
        }

        return c.json({ success: false, message: 'Webhook verification failed' }, 400)
    }
})
