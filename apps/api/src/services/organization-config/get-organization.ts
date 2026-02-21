import { OrganizationNotFoundError } from '../../context/errors'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import { Logger } from '../../utils/logger'

export function getOrganizationService(organizationsRepo: OrganizationsRepository) {
	return async (clerkOrgId: string) => {
		Logger.info('Getting organization by Clerk ID', { clerkOrgId })

		const organization = await organizationsRepo.getOrganizationByClerkId(clerkOrgId)
		if (!organization) {
			throw new OrganizationNotFoundError()
		}

		Logger.info('Organization retrieved successfully', {
			organizationId: organization.id,
			clerkOrgId,
		})

		return organization
	}
}
