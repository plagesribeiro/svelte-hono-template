import { BookingConflictError } from '../../context/errors'
import type { BookingsRepository } from '../../repositories/bookings.repo'
import { Logger } from '../../utils/logger'

export function createBookingService(bookingsRepo: BookingsRepository) {
	return async (input: {
		orgId: string
		dimClientId: string
		dimProfessionalId?: string
		dimServiceId?: string
		dimCourtId?: string
		startTime: string // ISO
		endTime: string // ISO
		priceCharged?: number
		notes?: string
		dimChatSessionId?: string
	}) => {
		Logger.info('Creating booking', {
			orgId: input.orgId,
			clientId: input.dimClientId,
			professionalId: input.dimProfessionalId,
			courtId: input.dimCourtId,
		})

		const startTimeDate = new Date(input.startTime)
		const endTimeDate = new Date(input.endTime)

		// Check for conflicts
		const conflicts = await bookingsRepo.getConflicting({
			orgId: input.orgId,
			startTime: startTimeDate,
			endTime: endTimeDate,
			professionalId: input.dimProfessionalId,
			courtId: input.dimCourtId,
		})

		if (conflicts.length > 0) {
			Logger.warn('Booking conflict detected', {
				orgId: input.orgId,
				conflictCount: conflicts.length,
			})
			throw new BookingConflictError()
		}

		const booking = await bookingsRepo.create({
			dimOrganizationId: input.orgId,
			dimClientId: input.dimClientId,
			dimProfessionalId: input.dimProfessionalId,
			dimServiceId: input.dimServiceId,
			dimCourtId: input.dimCourtId,
			startTime: startTimeDate,
			endTime: endTimeDate,
			priceCharged: input.priceCharged,
			notes: input.notes,
			dimChatSessionId: input.dimChatSessionId,
		})

		Logger.info('Booking created successfully', { bookingId: booking.id, orgId: input.orgId })

		return booking
	}
}
