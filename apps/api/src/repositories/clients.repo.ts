import { type DbClient, dimClientTable } from 'db'
import { and, asc, eq, ilike, isNull, or, sql } from 'drizzle-orm'

export type Client = typeof dimClientTable.$inferSelect

export class ClientsRepository {
	constructor(private readonly db: DbClient) {}

	async list(
		orgId: string,
		opts: { page: number; limit: number; search?: string }
	): Promise<{ data: Client[]; total: number }> {
		const conditions = [
			eq(dimClientTable.dimOrganizationId, orgId),
			isNull(dimClientTable.deletedAt),
		]

		if (opts.search) {
			const searchCondition = or(
				ilike(dimClientTable.name, `%${opts.search}%`),
				ilike(dimClientTable.phone, `%${opts.search}%`)
			)
			if (searchCondition) {
				conditions.push(searchCondition)
			}
		}

		const whereClause = and(...conditions)

		const [data, [{ count }]] = await Promise.all([
			this.db
				.select()
				.from(dimClientTable)
				.where(whereClause)
				.orderBy(asc(dimClientTable.name))
				.limit(opts.limit)
				.offset((opts.page - 1) * opts.limit),
			this.db.select({ count: sql<number>`count(*)::int` }).from(dimClientTable).where(whereClause),
		])

		return { data, total: count }
	}

	async getById(id: string): Promise<Client | null> {
		const [client] = await this.db
			.select()
			.from(dimClientTable)
			.where(and(eq(dimClientTable.id, id), isNull(dimClientTable.deletedAt)))
			.limit(1)

		return client ?? null
	}

	async getByPhone(orgId: string, phone: string): Promise<Client | null> {
		const [client] = await this.db
			.select()
			.from(dimClientTable)
			.where(
				and(
					eq(dimClientTable.dimOrganizationId, orgId),
					eq(dimClientTable.phone, phone),
					isNull(dimClientTable.deletedAt)
				)
			)
			.limit(1)

		return client ?? null
	}

	async upsertByPhone(input: {
		dimOrganizationId: string
		name: string
		phone: string
		email?: string | null
	}): Promise<Client> {
		const [client] = await this.db
			.insert(dimClientTable)
			.values({
				dimOrganizationId: input.dimOrganizationId,
				name: input.name,
				phone: input.phone,
				email: input.email ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			})
			.onConflictDoUpdate({
				target: [dimClientTable.dimOrganizationId, dimClientTable.phone],
				set: {
					name: input.name,
					email: input.email ?? null,
					updatedAt: new Date(),
					deletedAt: null, // Restore if soft deleted
				},
			})
			.returning()

		if (!client) {
			throw new Error('Failed to upsert client')
		}

		return client
	}
}
