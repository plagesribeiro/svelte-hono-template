import type { OrganizationsRepository } from '../../repositories/organizations.repo'

export function deleteOrganizationByClerkIdService(organizationsRepo: OrganizationsRepository) {
	return async (clerkOrganizationId: string) => {
		await organizationsRepo.deleteOrganizationByClerkId(clerkOrganizationId)
	}
}
