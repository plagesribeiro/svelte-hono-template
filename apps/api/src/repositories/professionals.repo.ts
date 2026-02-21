import { type DbClient, dimProfessionalTable } from 'db'
import { and, asc, eq, isNull } from 'drizzle-orm'

export type Professional = typeof dimProfessionalTable.$inferSelect

export class ProfessionalsRepository {
	constructor(private readonly db: DbClient) {}

	async list(orgId: string): Promise<Professional[]> {
		return this.db
			.select()
			.from(dimProfessionalTable)
			.where(
				and(
					eq(dimProfessionalTable.dimOrganizationId, orgId),
					isNull(dimProfessionalTable.deletedAt)
				)
			)
			.orderBy(asc(dimProfessionalTable.name))
	}

	async getById(id: string): Promise<Professional | null> {
		const [professional] = await this.db
			.select()
			.from(dimProfessionalTable)
			.where(and(eq(dimProfessionalTable.id, id), isNull(dimProfessionalTable.deletedAt)))
			.limit(1)

		return professional ?? null
	}

	async create(input: {
		dimOrganizationId: string
		name: string
		phone?: string | null
		email?: string | null
		avatarUrl?: string | null
		workingHours?: unknown
		isActive?: boolean
	}): Promise<Professional> {
		const [professional] = await this.db
			.insert(dimProfessionalTable)
			.values({
				dimOrganizationId: input.dimOrganizationId,
				name: input.name,
				phone: input.phone ?? null,
				email: input.email ?? null,
				avatarUrl: input.avatarUrl ?? null,
				workingHours: input.workingHours ?? null,
				isActive: input.isActive ?? true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		if (!professional) {
			throw new Error('Failed to create professional')
		}

		return professional
	}

	async update(
		id: string,
		input: Partial<{
			name: string
			phone: string | null
			email: string | null
			avatarUrl: string | null
			workingHours: unknown
			isActive: boolean
		}>
	): Promise<Professional> {
		const [professional] = await this.db
			.update(dimProfessionalTable)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(and(eq(dimProfessionalTable.id, id), isNull(dimProfessionalTable.deletedAt)))
			.returning()

		if (!professional) {
			throw new Error('Professional not found or already deleted')
		}

		return professional
	}

	async softDelete(id: string): Promise<void> {
		await this.db
			.update(dimProfessionalTable)
			.set({ deletedAt: new Date() })
			.where(and(eq(dimProfessionalTable.id, id), isNull(dimProfessionalTable.deletedAt)))
	}
}
