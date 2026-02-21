import { CourtNotFoundError } from '../../context/errors'
import type { CourtsRepository } from '../../repositories/courts.repo'
import { Logger } from '../../utils/logger'

export function deleteCourtService(courtsRepo: CourtsRepository) {
	return async (id: string) => {
		Logger.info('Deleting court', { courtId: id })

		const existing = await courtsRepo.getById(id)
		if (!existing) {
			throw new CourtNotFoundError()
		}

		await courtsRepo.softDelete(id)

		Logger.info('Court deleted successfully', { courtId: id })
	}
}
