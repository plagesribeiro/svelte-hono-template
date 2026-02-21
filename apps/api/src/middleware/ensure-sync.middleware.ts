import { createMiddleware } from 'hono/factory'
import { Logger } from '../utils/logger'

export function ensureSyncMiddleware() {
	return createMiddleware<{ Bindings: CloudflareBindings }>(async (c, next) => {
		const userData = c.var.userData
		const clerkUserId = userData?.clerkUserId
		const clerkOrgId = userData?.clerkOrgId
		const clerkRole = userData?.clerkRole

		// Skip for API key auth or missing auth data
		if (!clerkUserId || !clerkOrgId || clerkUserId === 'admin') {
			return await next()
		}

		const services = c.var.services

		// Check user + org in parallel (fast indexed queries)
		const [existingUser, existingOrg] = await Promise.all([
			services.usersRepository.getUserByClerkId(clerkUserId),
			services.organizationsRepository.getOrganizationByClerkId(clerkOrgId),
		])

		let userSynced = !!existingUser
		let orgSynced = !!existingOrg

		// Sync missing records from Clerk API (only happens on first request)
		if (!existingUser) {
			try {
				Logger.info('[EnsureSync] User not found in DB, syncing from Clerk', { clerkUserId })
				const clerkUser = await services.clerk.users.getUser(clerkUserId)

				const email = clerkUser.primaryEmailAddress?.emailAddress
				if (!email) {
					Logger.error('[EnsureSync] Clerk user has no primary email', { clerkUserId })
					return await next()
				}

				const username = clerkUser.username ?? email
				const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email

				await services.users.upsertUserFromClerk({
					clerkUserId,
					email,
					name,
					username,
				})
				userSynced = true
				Logger.info('[EnsureSync] User synced successfully', { clerkUserId })
			} catch (error) {
				Logger.error(
					'[EnsureSync] Failed to sync user from Clerk',
					error instanceof Error ? error : new Error(String(error))
				)
				return await next()
			}
		}

		if (!existingOrg) {
			try {
				Logger.info('[EnsureSync] Organization not found in DB, syncing from Clerk', {
					clerkOrgId,
				})
				const clerkOrg = await services.clerk.organizations.getOrganization({
					organizationId: clerkOrgId,
				})

				const orgEmail =
					clerkOrg.publicMetadata?.email ??
					(await services.usersRepository.getUserByClerkId(clerkUserId))?.email ??
					''

				await services.organizations.upsertOrganizationFromClerk({
					clerkOrganizationId: clerkOrgId,
					name: clerkOrg.name,
					email: String(orgEmail),
					clerkUserId,
				})
				orgSynced = true
				Logger.info('[EnsureSync] Organization synced successfully', { clerkOrgId })
			} catch (error) {
				Logger.error(
					'[EnsureSync] Failed to sync organization from Clerk',
					error instanceof Error ? error : new Error(String(error))
				)
				return await next()
			}
		}

		// Ensure membership exists if both user and org were synced
		if (userSynced && orgSynced && (!existingUser || !existingOrg)) {
			try {
				const role = clerkRole === 'org:admin' ? 'admin' : 'member'
				await services.organizationMembers.upsertMember({
					clerkOrganizationId: clerkOrgId,
					clerkUserId,
					role: role as 'admin' | 'member' | 'viewer',
				})
				Logger.info('[EnsureSync] Membership ensured', { clerkUserId, clerkOrgId, role })
			} catch (error) {
				Logger.error(
					'[EnsureSync] Failed to ensure membership',
					error instanceof Error ? error : new Error(String(error))
				)
			}
		}

		await next()
	})
}
