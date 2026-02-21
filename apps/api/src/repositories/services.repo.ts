import { type DbClient, dimServiceTable } from 'db'
import { and, asc, eq, isNull } from 'drizzle-orm'

export type Service = typeof dimServiceTable.$inferSelect

export class ServicesRepository {
	constructor(private readonly db: DbClient) {}

	async list(orgId: string): Promise<Service[]> {
		return this.db
			.select()
			.from(dimServiceTable)
			.where(and(eq(dimServiceTable.dimOrganizationId, orgId), isNull(dimServiceTable.deletedAt)))
			.orderBy(asc(dimServiceTable.name))
	}

	async getById(id: string): Promise<Service | null> {
		const [service] = await this.db
			.select()
			.from(dimServiceTable)
			.where(and(eq(dimServiceTable.id, id), isNull(dimServiceTable.deletedAt)))
			.limit(1)

		return service ?? null
	}

	async create(input: {
		dimOrganizationId: string
		name: string
		description?: string | null
		durationMinutes: number
		price: number
		currency?: string
		isActive?: boolean
	}): Promise<Service> {
		const [service] = await this.db
			.insert(dimServiceTable)
			.values({
				dimOrganizationId: input.dimOrganizationId,
				name: input.name,
				description: input.description ?? null,
				durationMinutes: input.durationMinutes,
				price: input.price,
				currency: input.currency ?? 'BRL',
				isActive: input.isActive ?? true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		if (!service) {
			throw new Error('Failed to create service')
		}

		return service
	}

	async update(
		id: string,
		input: Partial<{
			name: string
			description: string | null
			durationMinutes: number
			price: number
			currency: string
			isActive: boolean
		}>
	): Promise<Service> {
		const [service] = await this.db
			.update(dimServiceTable)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(and(eq(dimServiceTable.id, id), isNull(dimServiceTable.deletedAt)))
			.returning()

		if (!service) {
			throw new Error('Service not found or already deleted')
		}

		return service
	}

	async softDelete(id: string): Promise<void> {
		await this.db
			.update(dimServiceTable)
			.set({ deletedAt: new Date() })
			.where(and(eq(dimServiceTable.id, id), isNull(dimServiceTable.deletedAt)))
	}
}
