import type { BookingsRepository } from '../../repositories/bookings.repo'
import { Logger } from '../../utils/logger'

export function listBookingsService(bookingsRepo: BookingsRepository) {
	return async (
		orgId: string,
		opts: {
			startDate?: string
			endDate?: string
			status?: string
			professionalId?: string
			courtId?: string
			page?: number
			limit?: number
		}
	) => {
		const page = opts.page ?? 1
		const limit = opts.limit ?? 20

		Logger.info('Listing bookings', { orgId, page, limit })

		const { data, total } = await bookingsRepo.list(orgId, {
			startDate: opts.startDate ? new Date(opts.startDate) : undefined,
			endDate: opts.endDate ? new Date(opts.endDate) : undefined,
			status: opts.status as 'confirmed' | 'cancelled' | 'completed' | 'no_show' | undefined,
			professionalId: opts.professionalId,
			courtId: opts.courtId,
			page,
			limit,
		})

		return {
			data,
			total,
			page,
			limit,
		}
	}
}
