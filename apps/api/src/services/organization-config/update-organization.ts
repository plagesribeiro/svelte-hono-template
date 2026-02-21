import { OrganizationNotFoundError } from '../../context/errors'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import { Logger } from '../../utils/logger'

export function updateOrganizationService(organizationsRepo: OrganizationsRepository) {
	return async (
		clerkOrgId: string,
		input: Partial<{
			slug: string | null
			businessType: 'barbershop' | 'court' | null
			businessHours: unknown
			timezone: string | null
			phone: string | null
			address: string | null
			logoUrl: string | null
			chatWelcomeMessage: string | null
			chatInstructions: string | null
			onboardingCompleted: boolean
			name: string
			description: string | null
		}>
	) => {
		Logger.info('Updating organization', { clerkOrgId })

		const org = await organizationsRepo.getOrganizationByClerkId(clerkOrgId)
		if (!org) {
			throw new OrganizationNotFoundError()
		}

		const updated = await organizationsRepo.updateById(org.id, input)

		Logger.info('Organization updated successfully', {
			organizationId: org.id,
			clerkOrgId,
		})

		return updated
	}
}
