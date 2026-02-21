import type { Booking, BookingsRepository } from '../../repositories/bookings.repo'
import { cancelBookingService } from './cancel-booking'
import { createBookingService } from './create-booking'
import { getBookingService } from './get-booking'
import { listBookingsService } from './list-bookings'
import { rescheduleBookingService } from './reschedule-booking'

function formatBooking(b: Booking) {
	return {
		id: b.id,
		dimOrganizationId: b.dimOrganizationId,
		dimClientId: b.dimClientId,
		dimProfessionalId: b.dimProfessionalId,
		dimServiceId: b.dimServiceId,
		dimCourtId: b.dimCourtId,
		startTime: b.startTime.toISOString(),
		endTime: b.endTime.toISOString(),
		status: b.status,
		priceCharged: b.priceCharged ? Number(b.priceCharged) : null,
		notes: b.notes,
		cancelledAt: b.cancelledAt?.toISOString() ?? null,
		cancelReason: b.cancelReason,
		version: b.version,
		createdAt: b.createdAt.toISOString(),
		updatedAt: b.updatedAt.toISOString(),
	}
}

export class BookingsService {
	private readonly _create: ReturnType<typeof createBookingService>
	private readonly _cancel: ReturnType<typeof cancelBookingService>
	private readonly _reschedule: ReturnType<typeof rescheduleBookingService>
	private readonly _list: ReturnType<typeof listBookingsService>
	private readonly _get: ReturnType<typeof getBookingService>

	constructor(readonly bookingsRepo: BookingsRepository) {
		this._create = createBookingService(bookingsRepo)
		this._cancel = cancelBookingService(bookingsRepo)
		this._reschedule = rescheduleBookingService(bookingsRepo)
		this._list = listBookingsService(bookingsRepo)
		this._get = getBookingService(bookingsRepo)
	}

	async list(
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
	) {
		const { data, total, page, limit } = await this._list(orgId, opts)

		return {
			data: data.map(formatBooking),
			total,
			page,
			limit,
		}
	}

	async getById(id: string) {
		const booking = await this._get(id)
		return formatBooking(booking)
	}

	async create(
		orgId: string,
		input: {
			dimClientId: string
			dimProfessionalId?: string
			dimServiceId?: string
			dimCourtId?: string
			startTime: string
			endTime: string
			priceCharged?: number
			notes?: string
			dimChatSessionId?: string
		}
	) {
		const booking = await this._create({
			orgId,
			dimClientId: input.dimClientId,
			dimProfessionalId: input.dimProfessionalId,
			dimServiceId: input.dimServiceId,
			dimCourtId: input.dimCourtId,
			startTime: input.startTime,
			endTime: input.endTime,
			priceCharged: input.priceCharged,
			notes: input.notes,
			dimChatSessionId: input.dimChatSessionId,
		})
		return formatBooking(booking)
	}

	async cancel(id: string, cancelReason?: string) {
		const updated = await this._cancel({ bookingId: id, cancelReason })
		return formatBooking(updated)
	}

	async reschedule(id: string, newStartTime: string, newEndTime: string) {
		const updated = await this._reschedule({
			bookingId: id,
			newStartTime,
			newEndTime,
		})
		return formatBooking(updated)
	}
}
