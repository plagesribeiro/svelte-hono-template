import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import { Logger } from '../../utils/logger'

export function linkProfessionalServiceService(
	professionalServicesRepo: ProfessionalServicesRepository
) {
	return async (
		professionalId: string,
		input: {
			dimServiceId: string
			customDurationMinutes?: number | null
			customPrice?: number | null
		}
	) => {
		Logger.info('Linking professional to service', {
			professionalId,
			serviceId: input.dimServiceId,
		})

		const link = await professionalServicesRepo.link({
			dimProfessionalId: professionalId,
			dimServiceId: input.dimServiceId,
			customDurationMinutes: input.customDurationMinutes,
			customPrice: input.customPrice,
		})

		Logger.info('Professional linked to service successfully', {
			professionalId,
			serviceId: input.dimServiceId,
			linkId: link.id,
		})

		return link
	}
}
