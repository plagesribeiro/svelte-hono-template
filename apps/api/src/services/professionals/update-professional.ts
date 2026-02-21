import { ProfessionalNotFoundError } from '../../context/errors'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { Logger } from '../../utils/logger'

export function updateProfessionalService(professionalsRepo: ProfessionalsRepository) {
	return async (
		id: string,
		input: Partial<{
			name: string
			phone: string | null
			email: string | null
			avatarUrl: string | null
			workingHours: unknown
			isActive: boolean
		}>
	) => {
		Logger.info('Updating professional', { professionalId: id })

		const existing = await professionalsRepo.getById(id)
		if (!existing) {
			throw new ProfessionalNotFoundError()
		}

		const professional = await professionalsRepo.update(id, input)

		Logger.info('Professional updated successfully', { professionalId: id })

		return professional
	}
}
