import { type DbClient, dimBookingTable } from 'db'
import { and, asc, eq, gt, gte, inArray, isNull, lt, lte, type SQL, sql } from 'drizzle-orm'

export type Booking = typeof dimBookingTable.$inferSelect
export type BookingStatus = Booking['status']

export class BookingsRepository {
	constructor(private readonly db: DbClient) {}

	async list(
		orgId: string,
		opts: {
			startDate?: Date
			endDate?: Date
			status?: BookingStatus
			professionalId?: string
			courtId?: string
			page: number
			limit: number
		}
	): Promise<{ data: Booking[]; total: number }> {
		const conditions: SQL[] = [
			eq(dimBookingTable.dimOrganizationId, orgId),
			isNull(dimBookingTable.deletedAt),
		]

		if (opts.startDate) {
			conditions.push(gte(dimBookingTable.startTime, opts.startDate))
		}
		if (opts.endDate) {
			conditions.push(lte(dimBookingTable.endTime, opts.endDate))
		}
		if (opts.status) {
			conditions.push(eq(dimBookingTable.status, opts.status))
		}
		if (opts.professionalId) {
			conditions.push(eq(dimBookingTable.dimProfessionalId, opts.professionalId))
		}
		if (opts.courtId) {
			conditions.push(eq(dimBookingTable.dimCourtId, opts.courtId))
		}

		const whereClause = and(...conditions)

		const [data, [{ count }]] = await Promise.all([
			this.db
				.select()
				.from(dimBookingTable)
				.where(whereClause)
				.orderBy(asc(dimBookingTable.startTime))
				.limit(opts.limit)
				.offset((opts.page - 1) * opts.limit),
			this.db
				.select({ count: sql<number>`count(*)::int` })
				.from(dimBookingTable)
				.where(whereClause),
		])

		return { data, total: count }
	}

	async getById(id: string): Promise<Booking | null> {
		const [booking] = await this.db
			.select()
			.from(dimBookingTable)
			.where(and(eq(dimBookingTable.id, id), isNull(dimBookingTable.deletedAt)))
			.limit(1)

		return booking ?? null
	}

	async create(input: {
		dimOrganizationId: string
		dimClientId: string
		dimProfessionalId?: string | null
		dimServiceId?: string | null
		dimCourtId?: string | null
		startTime: Date
		endTime: Date
		priceCharged?: number | null
		notes?: string | null
		dimChatSessionId?: string | null
		status?: BookingStatus
	}): Promise<Booking> {
		const [booking] = await this.db
			.insert(dimBookingTable)
			.values({
				dimOrganizationId: input.dimOrganizationId,
				dimClientId: input.dimClientId,
				dimProfessionalId: input.dimProfessionalId ?? null,
				dimServiceId: input.dimServiceId ?? null,
				dimCourtId: input.dimCourtId ?? null,
				startTime: input.startTime,
				endTime: input.endTime,
				priceCharged: input.priceCharged ?? null,
				notes: input.notes ?? null,
				dimChatSessionId: input.dimChatSessionId ?? null,
				status: input.status ?? 'confirmed',
				version: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		if (!booking) {
			throw new Error('Failed to create booking')
		}

		return booking
	}

	async getConflicting(opts: {
		orgId: string
		startTime: Date
		endTime: Date
		professionalId?: string
		courtId?: string
		excludeBookingId?: string
	}): Promise<Booking[]> {
		const conditions: SQL[] = [
			eq(dimBookingTable.dimOrganizationId, opts.orgId),
			lt(dimBookingTable.startTime, opts.endTime),
			gt(dimBookingTable.endTime, opts.startTime),
			inArray(dimBookingTable.status, ['confirmed']),
			isNull(dimBookingTable.deletedAt),
		]

		if (opts.professionalId) {
			conditions.push(eq(dimBookingTable.dimProfessionalId, opts.professionalId))
		}
		if (opts.courtId) {
			conditions.push(eq(dimBookingTable.dimCourtId, opts.courtId))
		}
		if (opts.excludeBookingId) {
			conditions.push(sql`${dimBookingTable.id} != ${opts.excludeBookingId}`)
		}

		return this.db
			.select()
			.from(dimBookingTable)
			.where(and(...conditions))
	}

	async listByDateRange(
		orgId: string,
		startDate: Date,
		endDate: Date,
		opts?: { professionalId?: string; courtId?: string }
	): Promise<Booking[]> {
		const conditions: SQL[] = [
			eq(dimBookingTable.dimOrganizationId, orgId),
			gte(dimBookingTable.startTime, startDate),
			lte(dimBookingTable.endTime, endDate),
			eq(dimBookingTable.status, 'confirmed'),
			isNull(dimBookingTable.deletedAt),
		]

		if (opts?.professionalId) {
			conditions.push(eq(dimBookingTable.dimProfessionalId, opts.professionalId))
		}
		if (opts?.courtId) {
			conditions.push(eq(dimBookingTable.dimCourtId, opts.courtId))
		}

		return this.db
			.select()
			.from(dimBookingTable)
			.where(and(...conditions))
			.orderBy(asc(dimBookingTable.startTime))
	}

	async updateWithVersion(
		id: string,
		version: number,
		updates: Partial<{
			startTime: Date
			endTime: Date
			status: BookingStatus
			cancelledAt: Date
			cancelReason: string
			priceCharged: number
			notes: string
			dimProfessionalId: string
			dimServiceId: string
			dimCourtId: string
		}>
	): Promise<Booking | null> {
		const [booking] = await this.db
			.update(dimBookingTable)
			.set({
				...updates,
				version: version + 1,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(dimBookingTable.id, id),
					eq(dimBookingTable.version, version),
					isNull(dimBookingTable.deletedAt)
				)
			)
			.returning()

		return booking ?? null
	}
}
