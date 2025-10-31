import { Logger, OrganizationNotFoundError, UserNotFoundError } from '../../context/errors'
import type { OrganizationMembersRepository } from '../../repositories/organization-members.repo'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'

export function deleteMemberService(
    organizationMembersRepo: OrganizationMembersRepository,
    organizationsRepo: OrganizationsRepository,
    usersRepo: UsersRepository,
) {
    return async (input: { clerkOrganizationId: string; clerkUserId: string }) => {
        const { clerkOrganizationId, clerkUserId } = input

        Logger.info('Deleting organization member', { clerkOrganizationId, clerkUserId })

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

        // Delete the membership
        await organizationMembersRepo.deleteMember(organization.id, user.id)

        Logger.info('Organization member deleted successfully', {
            organizationId: organization.id,
            userId: user.id,
        })
    }
}
