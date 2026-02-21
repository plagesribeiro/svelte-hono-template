import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { Logger } from '../../utils/logger'

export function createProfessionalService(professionalsRepo: ProfessionalsRepository) {
	return async (
		orgId: string,
		input: {
			name: string
			phone?: string | null
			email?: string | null
			avatarUrl?: string | null
			workingHours?: unknown
			isActive?: boolean
		}
	) => {
		Logger.info('Creating professional', { orgId, name: input.name })

		const professional = await professionalsRepo.create({
			dimOrganizationId: orgId,
			...input,
		})

		Logger.info('Professional created successfully', {
			orgId,
			professionalId: professional.id,
		})

		return professional
	}
}
