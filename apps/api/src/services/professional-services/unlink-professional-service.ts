import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import { Logger } from '../../utils/logger'

export function unlinkProfessionalServiceService(
	professionalServicesRepo: ProfessionalServicesRepository
) {
	return async (professionalId: string, serviceId: string) => {
		Logger.info('Unlinking professional from service', {
			professionalId,
			serviceId,
		})

		await professionalServicesRepo.unlink(professionalId, serviceId)

		Logger.info('Professional unlinked from service successfully', {
			professionalId,
			serviceId,
		})
	}
}
