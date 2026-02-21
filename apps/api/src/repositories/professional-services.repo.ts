import { type DbClient, dimProfessionalServiceTable, dimServiceTable } from 'db'
import { and, eq, isNull } from 'drizzle-orm'

export type ProfessionalService = typeof dimProfessionalServiceTable.$inferSelect
export type Service = typeof dimServiceTable.$inferSelect

export class ProfessionalServicesRepository {
	constructor(private readonly db: DbClient) {}

	async listByProfessional(
		professionalId: string
	): Promise<(ProfessionalService & { service: Service })[]> {
		const rows = await this.db
			.select({
				id: dimProfessionalServiceTable.id,
				dimProfessionalId: dimProfessionalServiceTable.dimProfessionalId,
				dimServiceId: dimProfessionalServiceTable.dimServiceId,
				customDurationMinutes: dimProfessionalServiceTable.customDurationMinutes,
				customPrice: dimProfessionalServiceTable.customPrice,
				createdAt: dimProfessionalServiceTable.createdAt,
				updatedAt: dimProfessionalServiceTable.updatedAt,
				deletedAt: dimProfessionalServiceTable.deletedAt,
				service: {
					id: dimServiceTable.id,
					dimOrganizationId: dimServiceTable.dimOrganizationId,
					name: dimServiceTable.name,
					description: dimServiceTable.description,
					durationMinutes: dimServiceTable.durationMinutes,
					price: dimServiceTable.price,
					currency: dimServiceTable.currency,
					isActive: dimServiceTable.isActive,
					createdAt: dimServiceTable.createdAt,
					updatedAt: dimServiceTable.updatedAt,
					deletedAt: dimServiceTable.deletedAt,
				},
			})
			.from(dimProfessionalServiceTable)
			.innerJoin(dimServiceTable, eq(dimProfessionalServiceTable.dimServiceId, dimServiceTable.id))
			.where(
				and(
					eq(dimProfessionalServiceTable.dimProfessionalId, professionalId),
					isNull(dimProfessionalServiceTable.deletedAt),
					isNull(dimServiceTable.deletedAt)
				)
			)

		return rows as (ProfessionalService & { service: Service })[]
	}

	async link(input: {
		dimProfessionalId: string
		dimServiceId: string
		customDurationMinutes?: number | null
		customPrice?: number | null
	}): Promise<ProfessionalService> {
		const [professionalService] = await this.db
			.insert(dimProfessionalServiceTable)
			.values({
				dimProfessionalId: input.dimProfessionalId,
				dimServiceId: input.dimServiceId,
				customDurationMinutes: input.customDurationMinutes ?? null,
				customPrice: input.customPrice ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			})
			.onConflictDoUpdate({
				target: [
					dimProfessionalServiceTable.dimProfessionalId,
					dimProfessionalServiceTable.dimServiceId,
				],
				set: {
					customDurationMinutes: input.customDurationMinutes ?? null,
					customPrice: input.customPrice ?? null,
					updatedAt: new Date(),
					deletedAt: null, // Restore if soft deleted
				},
			})
			.returning()

		if (!professionalService) {
			throw new Error('Failed to link professional to service')
		}

		return professionalService
	}

	async unlink(professionalId: string, serviceId: string): Promise<void> {
		await this.db
			.update(dimProfessionalServiceTable)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(dimProfessionalServiceTable.dimProfessionalId, professionalId),
					eq(dimProfessionalServiceTable.dimServiceId, serviceId),
					isNull(dimProfessionalServiceTable.deletedAt)
				)
			)
	}
}
