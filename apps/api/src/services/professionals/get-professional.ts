import { ProfessionalNotFoundError } from '../../context/errors'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { Logger } from '../../utils/logger'

export function getProfessionalService(professionalsRepo: ProfessionalsRepository) {
	return async (id: string) => {
		Logger.info('Getting professional', { professionalId: id })

		const professional = await professionalsRepo.getById(id)
		if (!professional) {
			throw new ProfessionalNotFoundError()
		}

		Logger.info('Professional retrieved successfully', { professionalId: id })

		return professional
	}
}
