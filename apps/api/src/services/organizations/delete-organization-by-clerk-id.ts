import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import { Logger } from '../../utils/logger'

export function deleteOrganizationByClerkIdService(organizationsRepo: OrganizationsRepository) {
    return async (clerkOrganizationId: string) => {
        Logger.info('Deleting organization by Clerk ID', { clerkOrganizationId })

        await organizationsRepo.deleteOrganizationByClerkId(clerkOrganizationId)

        Logger.info('Organization deleted successfully', { clerkOrganizationId })
    }
}
