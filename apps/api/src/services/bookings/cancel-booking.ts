import { BookingConflictError, BookingNotFoundError } from '../../context/errors'
import type { BookingsRepository } from '../../repositories/bookings.repo'
import { Logger } from '../../utils/logger'

export function cancelBookingService(bookingsRepo: BookingsRepository) {
	return async (input: { bookingId: string; cancelReason?: string }) => {
		Logger.info('Cancelling booking', { bookingId: input.bookingId })

		const booking = await bookingsRepo.getById(input.bookingId)
		if (!booking) {
			throw new BookingNotFoundError()
		}

		const updated = await bookingsRepo.updateWithVersion(input.bookingId, booking.version, {
			status: 'cancelled',
			cancelledAt: new Date(),
			cancelReason: input.cancelReason,
		})

		if (!updated) {
			throw new BookingConflictError('Booking was modified by another request')
		}

		Logger.info('Booking cancelled successfully', { bookingId: input.bookingId })

		return updated
	}
}
