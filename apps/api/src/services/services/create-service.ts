import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

export function createServiceService(servicesRepo: ServicesRepository) {
	return async (
		orgId: string,
		input: {
			name: string
			description?: string | null
			durationMinutes: number
			price: number
			currency?: string
			isActive?: boolean
		}
	) => {
		Logger.info('Creating service', { orgId, name: input.name })

		const service = await servicesRepo.create({
			dimOrganizationId: orgId,
			...input,
		})

		Logger.info('Service created successfully', {
			orgId,
			serviceId: service.id,
		})

		return service
	}
}
