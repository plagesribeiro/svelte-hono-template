import type { BookingsRepository } from '../../repositories/bookings.repo'
import type { CourtsRepository } from '../../repositories/courts.repo'
import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import type { ServicesRepository } from '../../repositories/services.repo'
import { getAvailableSlotsService } from './get-available-slots'

export class AvailabilityService {
	public readonly getAvailableSlots: ReturnType<typeof getAvailableSlotsService>

	constructor(deps: {
		professionalsRepo: ProfessionalsRepository
		professionalServicesRepo: ProfessionalServicesRepository
		servicesRepo: ServicesRepository
		courtsRepo: CourtsRepository
		bookingsRepo: BookingsRepository
	}) {
		this.getAvailableSlots = getAvailableSlotsService(deps)
	}
}
