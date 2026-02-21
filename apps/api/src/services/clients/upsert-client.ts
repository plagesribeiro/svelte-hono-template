import type { ClientsRepository } from '../../repositories/clients.repo'
import { Logger } from '../../utils/logger'

export function upsertClientService(clientsRepo: ClientsRepository) {
	return async (
		orgId: string,
		input: {
			name: string
			phone: string
			email?: string | null
		}
	) => {
		Logger.info('Upserting client', { orgId, phone: input.phone })

		const client = await clientsRepo.upsertByPhone({
			dimOrganizationId: orgId,
			name: input.name,
			phone: input.phone,
			email: input.email,
		})

		Logger.info('Client upserted successfully', {
			orgId,
			clientId: client.id,
		})

		return client
	}
}
