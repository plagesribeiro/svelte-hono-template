import type { CourtsRepository } from '../../repositories/courts.repo'
import { Logger } from '../../utils/logger'

export function createCourtService(courtsRepo: CourtsRepository) {
	return async (
		orgId: string,
		input: {
			name: string
			sport: string
			description?: string | null
			pricePerSlot: number
			slotDurationMinutes?: number
			breakBetweenMinutes?: number
			operatingHours?: unknown
			currency?: string
			isActive?: boolean
		}
	) => {
		Logger.info('Creating court', { orgId, name: input.name })

		const court = await courtsRepo.create({
			dimOrganizationId: orgId,
			...input,
		})

		Logger.info('Court created successfully', {
			orgId,
			courtId: court.id,
		})

		return court
	}
}
