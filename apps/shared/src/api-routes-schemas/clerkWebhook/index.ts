import { z } from 'zod'

const ClerkUserEventSchema = z.object({
	type: z.enum(['user.created', 'user.updated', 'user.deleted']),
	data: z.object({
		id: z.string(),
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		email_addresses: z.array(
			z.object({
				email_address: z.string(),
				id: z.string(),
			})
		),
		username: z.string().optional(),
	}),
})

const ClerkOrganizationEventSchema = z.object({
	type: z.enum(['organization.created', 'organization.updated', 'organization.deleted']),
	data: z.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
		created_by: z.string(),
	}),
})

const ClerkOrganizationMembershipEventSchema = z.object({
	type: z.enum([
		'organizationMembership.created',
		'organizationMembership.updated',
		'organizationMembership.deleted',
	]),
	data: z.object({
		id: z.string(),
		organization: z.object({
			id: z.string(),
		}),
		public_user_data: z.object({
			user_id: z.string(),
		}),
		role: z.string(),
	}),
})

const ClerkWebhookEventSchema = z.union([
	ClerkUserEventSchema,
	ClerkOrganizationEventSchema,
	ClerkOrganizationMembershipEventSchema,
])

export const ClerkWebhookRequestSchema = ClerkWebhookEventSchema

export const ClerkWebhookResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
})

export type ClerkWebhookRequest = z.infer<typeof ClerkWebhookRequestSchema>
export type ClerkWebhookResponse = z.infer<typeof ClerkWebhookResponseSchema>
