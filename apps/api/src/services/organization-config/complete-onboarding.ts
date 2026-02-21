import { OrganizationNotFoundError } from '../../context/errors'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import { Logger } from '../../utils/logger'

export function completeOnboardingService(organizationsRepo: OrganizationsRepository) {
	return async (
		clerkOrgId: string,
		input: {
			slug: string
			businessType: 'barbershop' | 'court'
			businessHours?: unknown
			timezone?: string
			phone?: string | null
			address?: string | null
		}
	) => {
		Logger.info('Completing onboarding', { clerkOrgId, slug: input.slug })

		const org = await organizationsRepo.getOrganizationByClerkId(clerkOrgId)
		if (!org) {
			throw new OrganizationNotFoundError()
		}

		const updated = await organizationsRepo.updateById(org.id, {
			slug: input.slug,
			businessType: input.businessType,
			businessHours: input.businessHours ?? null,
			timezone: input.timezone ?? 'America/Sao_Paulo',
			phone: input.phone ?? null,
			address: input.address ?? null,
			onboardingCompleted: true,
		})

		Logger.info('Onboarding completed successfully', {
			organizationId: org.id,
			clerkOrgId,
			slug: input.slug,
			businessType: input.businessType,
		})

		return updated
	}
}
