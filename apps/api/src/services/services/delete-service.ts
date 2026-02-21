import { ServiceNotFoundError } from '../../context/errors'
import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

export function deleteServiceService(servicesRepo: ServicesRepository) {
	return async (id: string) => {
		Logger.info('Deleting service', { serviceId: id })

		const existing = await servicesRepo.getById(id)
		if (!existing) {
			throw new ServiceNotFoundError()
		}

		await servicesRepo.softDelete(id)

		Logger.info('Service deleted successfully', { serviceId: id })
	}
}
