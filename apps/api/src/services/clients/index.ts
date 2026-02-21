import type { ClientsRepository } from '../../repositories/clients.repo'
import { Logger } from '../../utils/logger'

export class ClientService {
	constructor(private readonly clientsRepo: ClientsRepository) {}

	async list(orgId: string, opts: { page?: number; limit?: number; search?: string }) {
		const page = opts.page ?? 1
		const limit = opts.limit ?? 20
		const { data, total } = await this.clientsRepo.list(orgId, {
			page,
			limit,
			search: opts.search,
		})
		return {
			data: data.map((c) => ({
				id: c.id,
				name: c.name,
				phone: c.phone,
				email: c.email,
				createdAt: c.createdAt.toISOString(),
				updatedAt: c.updatedAt.toISOString(),
			})),
			total,
			page,
			limit,
		}
	}

	async getById(id: string) {
		const client = await this.clientsRepo.getById(id)
		if (!client) {
			throw new Error(`Client not found: ${id}`)
		}
		return {
			id: client.id,
			name: client.name,
			phone: client.phone,
			email: client.email,
			createdAt: client.createdAt.toISOString(),
			updatedAt: client.updatedAt.toISOString(),
		}
	}

	async upsert(input: { orgId: string; name: string; phone: string; email?: string | null }) {
		Logger.info('Upserting client', { orgId: input.orgId, phone: input.phone })

		const client = await this.clientsRepo.upsertByPhone({
			dimOrganizationId: input.orgId,
			name: input.name,
			phone: input.phone,
			email: input.email,
		})

		Logger.info('Client upserted successfully', {
			orgId: input.orgId,
			clientId: client.id,
		})

		return client
	}
}
