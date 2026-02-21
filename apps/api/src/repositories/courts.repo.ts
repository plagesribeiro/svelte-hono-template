import { type DbClient, dimCourtTable } from 'db'
import { and, asc, eq, isNull } from 'drizzle-orm'

export type Court = typeof dimCourtTable.$inferSelect

export class CourtsRepository {
	constructor(private readonly db: DbClient) {}

	async list(orgId: string): Promise<Court[]> {
		return this.db
			.select()
			.from(dimCourtTable)
			.where(and(eq(dimCourtTable.dimOrganizationId, orgId), isNull(dimCourtTable.deletedAt)))
			.orderBy(asc(dimCourtTable.name))
	}

	async getById(id: string): Promise<Court | null> {
		const [court] = await this.db
			.select()
			.from(dimCourtTable)
			.where(and(eq(dimCourtTable.id, id), isNull(dimCourtTable.deletedAt)))
			.limit(1)

		return court ?? null
	}

	async create(input: {
		dimOrganizationId: string
		name: string
		sport: string
		description?: string | null
		pricePerSlot: number
		slotDurationMinutes?: number
		breakBetweenMinutes?: number
		operatingHours?: unknown
		currency?: string
		isActive?: boolean
	}): Promise<Court> {
		const [court] = await this.db
			.insert(dimCourtTable)
			.values({
				dimOrganizationId: input.dimOrganizationId,
				name: input.name,
				sport: input.sport,
				description: input.description ?? null,
				pricePerSlot: input.pricePerSlot,
				slotDurationMinutes: input.slotDurationMinutes ?? 60,
				breakBetweenMinutes: input.breakBetweenMinutes ?? 0,
				operatingHours: input.operatingHours ?? null,
				currency: input.currency ?? 'BRL',
				isActive: input.isActive ?? true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		if (!court) {
			throw new Error('Failed to create court')
		}

		return court
	}

	async update(
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
	): Promise<Court> {
		const [court] = await this.db
			.update(dimCourtTable)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(and(eq(dimCourtTable.id, id), isNull(dimCourtTable.deletedAt)))
			.returning()

		if (!court) {
			throw new Error('Court not found or already deleted')
		}

		return court
	}

	async softDelete(id: string): Promise<void> {
		await this.db
			.update(dimCourtTable)
			.set({ deletedAt: new Date() })
			.where(and(eq(dimCourtTable.id, id), isNull(dimCourtTable.deletedAt)))
	}
}
