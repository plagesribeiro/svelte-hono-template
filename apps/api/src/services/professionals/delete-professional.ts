import { ProfessionalNotFoundError } from '../../context/errors'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { Logger } from '../../utils/logger'

export function deleteProfessionalService(professionalsRepo: ProfessionalsRepository) {
	return async (id: string) => {
		Logger.info('Deleting professional', { professionalId: id })

		const existing = await professionalsRepo.getById(id)
		if (!existing) {
			throw new ProfessionalNotFoundError()
		}

		await professionalsRepo.softDelete(id)

		Logger.info('Professional deleted successfully', { professionalId: id })
	}
}
