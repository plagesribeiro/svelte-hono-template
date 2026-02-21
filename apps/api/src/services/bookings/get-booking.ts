import { BookingNotFoundError } from '../../context/errors'
import type { BookingsRepository } from '../../repositories/bookings.repo'
import { Logger } from '../../utils/logger'

export function getBookingService(bookingsRepo: BookingsRepository) {
	return async (bookingId: string) => {
		Logger.info('Getting booking', { bookingId })

		const booking = await bookingsRepo.getById(bookingId)
		if (!booking) {
			throw new BookingNotFoundError()
		}

		return booking
	}
}
