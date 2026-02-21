import { ServiceNotFoundError } from '../../context/errors'
import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

export function getServiceService(servicesRepo: ServicesRepository) {
	return async (id: string) => {
		Logger.info('Getting service', { serviceId: id })

		const service = await servicesRepo.getById(id)
		if (!service) {
			throw new ServiceNotFoundError()
		}

		Logger.info('Service retrieved successfully', { serviceId: id })

		return service
	}
}
