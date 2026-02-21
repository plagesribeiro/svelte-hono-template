import type { CourtsRepository } from '../../repositories/courts.repo'
import { Logger } from '../../utils/logger'

export function listCourtsService(courtsRepo: CourtsRepository) {
	return async (orgId: string) => {
		Logger.info('Listing courts', { orgId })

		const courts = await courtsRepo.list(orgId)

		Logger.info('Courts listed successfully', { orgId, count: courts.length })

		return courts
	}
}
