import type { ServicesRepository } from '../../repositories/services.repo'
import { createServiceService } from './create-service'
import { deleteServiceService } from './delete-service'
import { getServiceService } from './get-service'
import { listServicesService } from './list-services'
import { updateServiceService } from './update-service'

export class ServiceEntityService {
	public readonly list: ReturnType<typeof listServicesService>
	public readonly create: ReturnType<typeof createServiceService>
	public readonly update: ReturnType<typeof updateServiceService>
	public readonly delete: ReturnType<typeof deleteServiceService>
	public readonly get: ReturnType<typeof getServiceService>

	constructor(servicesRepo: ServicesRepository) {
		this.list = listServicesService(servicesRepo)
		this.create = createServiceService(servicesRepo)
		this.update = updateServiceService(servicesRepo)
		this.delete = deleteServiceService(servicesRepo)
		this.get = getServiceService(servicesRepo)
	}
}
