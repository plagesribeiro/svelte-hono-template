import { ClientNotFoundError } from '../../context/errors'
import type { ClientsRepository } from '../../repositories/clients.repo'
import { Logger } from '../../utils/logger'

export function getClientService(clientsRepo: ClientsRepository) {
	return async (id: string) => {
		Logger.info('Getting client', { clientId: id })

		const client = await clientsRepo.getById(id)
		if (!client) {
			throw new ClientNotFoundError()
		}

		Logger.info('Client retrieved successfully', { clientId: id })

		return client
	}
}
