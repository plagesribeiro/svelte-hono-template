import type { ClientsRepository } from '../../repositories/clients.repo'
import { Logger } from '../../utils/logger'

export function listClientsService(clientsRepo: ClientsRepository) {
	return async (orgId: string, opts: { page: number; limit: number; search?: string }) => {
		Logger.info('Listing clients', { orgId, page: opts.page, limit: opts.limit })

		const result = await clientsRepo.list(orgId, opts)

		Logger.info('Clients listed successfully', {
			orgId,
			count: result.data.length,
			total: result.total,
		})

		return result
	}
}
