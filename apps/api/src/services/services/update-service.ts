import { ServiceNotFoundError } from '../../context/errors'
import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

export function updateServiceService(servicesRepo: ServicesRepository) {
	return async (
		id: string,
		input: Partial<{
			name: string
			description: string | null
			durationMinutes: number
			price: number
			currency: string
			isActive: boolean
		}>
	) => {
		Logger.info('Updating service', { serviceId: id })

		const existing = await servicesRepo.getById(id)
		if (!existing) {
			throw new ServiceNotFoundError()
		}

		const service = await servicesRepo.update(id, input)

		Logger.info('Service updated successfully', { serviceId: id })

		return service
	}
}
