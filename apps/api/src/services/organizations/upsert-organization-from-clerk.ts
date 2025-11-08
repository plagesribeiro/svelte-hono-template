import type { ClerkClient } from '@clerk/backend'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'
import { Logger } from '../../utils/logger'

export function upsertOrganizationFromClerkService(
	organizationsRepo: OrganizationsRepository,
	usersRepo: UsersRepository,
	clerk: ClerkClient
) {
	return async (input: {
		clerkOrganizationId: string
		name: string
		email: string
		clerkUserId: string
	}) => {
		const { clerkOrganizationId, name, email, clerkUserId } = input

		Logger.info('Upserting organization from Clerk', { clerkOrganizationId, name, email })

		// Get or create the user first
		let user = await usersRepo.getUserByClerkId(clerkUserId)

		// If user doesn't exist, create a placeholder
		if (!user) {
			Logger.warn('User not found when upserting organization, creating user from Clerk', {
				clerkUserId,
			})
			const clerkUser = await clerk.users.getUser(clerkUserId)
			if (!clerkUser) {
				throw new Error('Clerk user not found')
			}

			const userEmail = clerkUser.primaryEmailAddress?.emailAddress
			if (!userEmail) {
				throw new Error('Clerk user has no primary email address')
			}

			const userUsername = clerkUser.username ? clerkUser.username : userEmail
			const userName = `${clerkUser.firstName} ${clerkUser.lastName}`

			user = await usersRepo.upsertUser({
				clerkUserId,
				email: userEmail,
				name: userName,
				username: userUsername,
			})
		}

		const organization = await organizationsRepo.upsertOrganization({
			clerkOrganizationId,
			name,
			email,
			createdBy: user.id,
			lastUpdatedBy: user.id,
		})

		Logger.info('Organization upserted successfully', {
			organizationId: organization.id,
			clerkOrganizationId,
		})

		return { organization }
	}
}
