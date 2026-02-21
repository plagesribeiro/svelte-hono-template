import { BookingConflictError, BookingNotFoundError } from '../../context/errors'
import type { BookingsRepository } from '../../repositories/bookings.repo'
import { Logger } from '../../utils/logger'

export function rescheduleBookingService(bookingsRepo: BookingsRepository) {
	return async (input: {
		bookingId: string
		newStartTime: string // ISO
		newEndTime: string // ISO
	}) => {
		Logger.info('Rescheduling booking', {
			bookingId: input.bookingId,
			newStartTime: input.newStartTime,
			newEndTime: input.newEndTime,
		})

		const booking = await bookingsRepo.getById(input.bookingId)
		if (!booking) {
			throw new BookingNotFoundError()
		}

		const newStart = new Date(input.newStartTime)
		const newEnd = new Date(input.newEndTime)

		// Check conflicts for new time (excluding current booking)
		const conflicts = await bookingsRepo.getConflicting({
			orgId: booking.dimOrganizationId,
			startTime: newStart,
			endTime: newEnd,
			professionalId: booking.dimProfessionalId ?? undefined,
			courtId: booking.dimCourtId ?? undefined,
			excludeBookingId: booking.id,
		})

		if (conflicts.length > 0) {
			Logger.warn('Reschedule conflict detected', {
				bookingId: input.bookingId,
				conflictCount: conflicts.length,
			})
			throw new BookingConflictError()
		}

		const updated = await bookingsRepo.updateWithVersion(booking.id, booking.version, {
			startTime: newStart,
			endTime: newEnd,
		})

		if (!updated) {
			throw new BookingConflictError('Booking was modified by another request')
		}

		Logger.info('Booking rescheduled successfully', { bookingId: input.bookingId })

		return updated
	}
}
