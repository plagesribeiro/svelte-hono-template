import { OrganizationNotFoundError } from '../../context/errors'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import { completeOnboardingService } from './complete-onboarding'
import { getOrganizationService } from './get-organization'
import { updateOrganizationService } from './update-organization'

export class OrganizationConfigService {
	public readonly get: ReturnType<typeof getOrganizationService>
	public readonly update: ReturnType<typeof updateOrganizationService>
	public readonly completeOnboarding: ReturnType<typeof completeOnboardingService>

	private readonly organizationsRepo: OrganizationsRepository

	constructor(organizationsRepo: OrganizationsRepository) {
		this.organizationsRepo = organizationsRepo
		this.get = getOrganizationService(organizationsRepo)
		this.update = updateOrganizationService(organizationsRepo)
		this.completeOnboarding = completeOnboardingService(organizationsRepo)
	}

	/** Resolve clerkOrgId to the internal UUID */
	async resolveOrgId(clerkOrgId: string): Promise<string> {
		const org = await this.organizationsRepo.getOrganizationByClerkId(clerkOrgId)
		if (!org) {
			throw new Error(`Organization not found for clerkOrgId: ${clerkOrgId}`)
		}
		return org.id
	}

	/** Get organization by public slug */
	async getBySlug(slug: string) {
		const org = await this.organizationsRepo.getBySlug(slug)
		if (!org) {
			throw new OrganizationNotFoundError(`Organization not found for slug: ${slug}`)
		}
		return org
	}
}
