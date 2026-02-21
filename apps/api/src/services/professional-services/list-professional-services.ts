import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import { Logger } from '../../utils/logger'

export function listProfessionalServicesService(
	professionalServicesRepo: ProfessionalServicesRepository
) {
	return async (professionalId: string) => {
		Logger.info('Listing professional services', { professionalId })

		const professionalServices = await professionalServicesRepo.listByProfessional(professionalId)

		Logger.info('Professional services listed successfully', {
			professionalId,
			count: professionalServices.length,
		})

		return professionalServices
	}
}
