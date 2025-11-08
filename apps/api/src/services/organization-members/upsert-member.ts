import { Logger, OrganizationNotFoundError, UserNotFoundError } from '../../context/errors'
import type { OrganizationMembersRepository } from '../../repositories/organization-members.repo'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'

export function upsertMemberService(
	organizationMembersRepo: OrganizationMembersRepository,
	organizationsRepo: OrganizationsRepository,
	usersRepo: UsersRepository
) {
	return async (input: {
		clerkOrganizationId: string
		clerkUserId: string
		role: 'admin' | 'member' | 'viewer'
	}) => {
		const { clerkOrganizationId, clerkUserId, role } = input

		Logger.info('Upserting organization member', { clerkOrganizationId, clerkUserId, role })

		// Get organization by Clerk ID
		const organization = await organizationsRepo.getOrganizationByClerkId(clerkOrganizationId)
		if (!organization) {
			throw new OrganizationNotFoundError(clerkOrganizationId)
		}

		// Get user by Clerk ID
		const user = await usersRepo.getUserByClerkId(clerkUserId)
		if (!user) {
			throw new UserNotFoundError(clerkUserId)
		}

		// Upsert the membership
		const member = await organizationMembersRepo.upsertMember({
			organizationId: organization.id,
			userId: user.id,
			role,
		})

		Logger.info('Organization member upserted successfully', {
			memberId: member.id,
			organizationId: organization.id,
			userId: user.id,
		})

		return { member }
	}
}
