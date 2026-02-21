import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

export function listServicesService(servicesRepo: ServicesRepository) {
	return async (orgId: string) => {
		Logger.info('Listing services', { orgId })

		const services = await servicesRepo.list(orgId)

		Logger.info('Services listed successfully', { orgId, count: services.length })

		return services
	}
}
