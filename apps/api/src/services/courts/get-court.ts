import { CourtNotFoundError } from '../../context/errors'
import type { CourtsRepository } from '../../repositories/courts.repo'
import { Logger } from '../../utils/logger'

export function getCourtService(courtsRepo: CourtsRepository) {
	return async (id: string) => {
		Logger.info('Getting court', { courtId: id })

		const court = await courtsRepo.getById(id)
		if (!court) {
			throw new CourtNotFoundError()
		}

		Logger.info('Court retrieved successfully', { courtId: id })

		return court
	}
}
