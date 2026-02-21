import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { Logger } from '../../utils/logger'

export function listProfessionalsService(professionalsRepo: ProfessionalsRepository) {
	return async (orgId: string) => {
		Logger.info('Listing professionals', { orgId })

		const professionals = await professionalsRepo.list(orgId)

		Logger.info('Professionals listed successfully', { orgId, count: professionals.length })

		return professionals
	}
}
