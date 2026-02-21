import { CourtNotFoundError } from '../../context/errors'
import type { CourtsRepository } from '../../repositories/courts.repo'
import { Logger } from '../../utils/logger'

export function updateCourtService(courtsRepo: CourtsRepository) {
	return async (
		id: string,
		input: Partial<{
			name: string
			sport: string
			description: string | null
			pricePerSlot: number
			slotDurationMinutes: number
			breakBetweenMinutes: number
			operatingHours: unknown
			currency: string
			isActive: boolean
		}>
	) => {
		Logger.info('Updating court', { courtId: id })

		const existing = await courtsRepo.getById(id)
		if (!existing) {
			throw new CourtNotFoundError()
		}

		const court = await courtsRepo.update(id, input)

		Logger.info('Court updated successfully', { courtId: id })

		return court
	}
}
