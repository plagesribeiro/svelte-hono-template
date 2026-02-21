import type { BookingsRepository } from '../../repositories/bookings.repo'
import type { CourtsRepository } from '../../repositories/courts.repo'
import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import type { ServicesRepository } from '../../repositories/services.repo'
import { Logger } from '../../utils/logger'

// ─── Types ──────────────────────────────────────────────────────────────────

export type TimeSlot = {
	startTime: string // ISO string
	endTime: string // ISO string
	professionalId?: string
	professionalName?: string
	courtId?: string
	courtName?: string
}

export type BusinessHourEntry = {
	dayOfWeek: number // 0=Sunday, 1=Monday, ..., 6=Saturday
	openTime: string // HH:mm
	closeTime: string // HH:mm
	isOpen: boolean
}

type GetAvailableSlotsInput = {
	orgId: string
	orgBusinessHours: BusinessHourEntry[] | null
	date: string // YYYY-MM-DD
	professionalId?: string
	serviceId?: string
	courtId?: string
	businessType: string // 'barbershop' | 'court'
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Convert "HH:mm" + "YYYY-MM-DD" to a Date object.
 */
function parseTime(timeStr: string, dateStr: string): Date {
	const [hours, minutes] = timeStr.split(':').map(Number)
	const date = new Date(`${dateStr}T00:00:00`)
	date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
	return date
}

/**
 * Intersect two time ranges. Returns null if no overlap.
 */
function intersectTimeRanges(
	start1: Date,
	end1: Date,
	start2: Date,
	end2: Date
): { start: Date; end: Date } | null {
	const start = new Date(Math.max(start1.getTime(), start2.getTime()))
	const end = new Date(Math.min(end1.getTime(), end2.getTime()))
	if (start >= end) return null
	return { start, end }
}

/**
 * Generate fixed-duration time slots within a window.
 */
function generateSlots(
	windowStart: Date,
	windowEnd: Date,
	durationMinutes: number,
	breakMinutes = 0
): { start: Date; end: Date }[] {
	const slots: { start: Date; end: Date }[] = []
	let current = new Date(windowStart)
	while (true) {
		const slotEnd = new Date(current.getTime() + durationMinutes * 60000)
		if (slotEnd > windowEnd) break
		slots.push({ start: new Date(current), end: slotEnd })
		current = new Date(slotEnd.getTime() + breakMinutes * 60000)
	}
	return slots
}

/**
 * Check if a slot overlaps with any existing booking.
 */
function isSlotAvailable(
	slotStart: Date,
	slotEnd: Date,
	bookings: { startTime: Date; endTime: Date }[]
): boolean {
	return !bookings.some((b) => b.startTime < slotEnd && b.endTime > slotStart)
}

// ─── Barbershop Slots ───────────────────────────────────────────────────────

async function getBarbershopSlots(params: {
	orgId: string
	date: string
	dayOfWeek: number
	businessDay: BusinessHourEntry
	dayStart: Date
	dayEnd: Date
	professionalId?: string
	serviceId?: string
	professionalsRepo: ProfessionalsRepository
	professionalServicesRepo: ProfessionalServicesRepository
	servicesRepo: ServicesRepository
	bookingsRepo: BookingsRepository
}): Promise<{ slots: TimeSlot[] }> {
	const {
		orgId,
		date,
		dayOfWeek,
		businessDay,
		dayStart,
		dayEnd,
		professionalId,
		serviceId,
		professionalsRepo,
		professionalServicesRepo,
		servicesRepo,
		bookingsRepo,
	} = params

	// 1. Get professionals (filter by id if specified)
	let professionals = await professionalsRepo.list(orgId)
	professionals = professionals.filter((p) => p.isActive)
	if (professionalId) {
		professionals = professionals.filter((p) => p.id === professionalId)
	}

	if (professionals.length === 0) return { slots: [] }

	// 2. Get service duration
	let baseDurationMinutes = 30 // default slot duration
	let service: { id: string; durationMinutes: number } | null = null
	if (serviceId) {
		const svc = await servicesRepo.getById(serviceId)
		if (svc) {
			baseDurationMinutes = svc.durationMinutes
			service = { id: svc.id, durationMinutes: svc.durationMinutes }
		}
	}

	// 3. Business hours window
	const businessStart = parseTime(businessDay.openTime, date)
	const businessEnd = parseTime(businessDay.closeTime, date)

	// 4. Get all bookings for this date range
	const allBookings = await bookingsRepo.listByDateRange(orgId, dayStart, dayEnd, {
		professionalId: professionalId,
	})

	const allSlots: TimeSlot[] = []

	for (const prof of professionals) {
		// Get professional's working hours for this day
		const workingHours = (prof.workingHours as BusinessHourEntry[] | null)?.find(
			(wh) => wh.dayOfWeek === dayOfWeek
		)

		// If professional has working hours defined and isn't working today, skip
		if (prof.workingHours && (!workingHours || !workingHours.isOpen)) {
			continue
		}

		// Determine effective work window
		let effectiveStart = businessStart
		let effectiveEnd = businessEnd

		if (workingHours) {
			const profStart = parseTime(workingHours.openTime, date)
			const profEnd = parseTime(workingHours.closeTime, date)
			const intersection = intersectTimeRanges(businessStart, businessEnd, profStart, profEnd)
			if (!intersection) continue
			effectiveStart = intersection.start
			effectiveEnd = intersection.end
		}

		// Determine slot duration (check for custom duration on professional-service link)
		let slotDuration = baseDurationMinutes
		if (service) {
			const profServices = await professionalServicesRepo.listByProfessional(prof.id)
			const profService = profServices.find((ps) => ps.dimServiceId === service?.id)
			if (profService?.customDurationMinutes) {
				slotDuration = profService.customDurationMinutes
			}
		}

		// Generate time slots
		const slots = generateSlots(effectiveStart, effectiveEnd, slotDuration)

		// Get bookings for this professional
		const profBookings = allBookings.filter((b) => b.dimProfessionalId === prof.id)

		// Filter available slots
		for (const slot of slots) {
			if (isSlotAvailable(slot.start, slot.end, profBookings)) {
				allSlots.push({
					startTime: slot.start.toISOString(),
					endTime: slot.end.toISOString(),
					professionalId: prof.id,
					professionalName: prof.name,
				})
			}
		}
	}

	// Sort by start time, then by professional name
	allSlots.sort((a, b) => {
		const timeDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
		if (timeDiff !== 0) return timeDiff
		return (a.professionalName ?? '').localeCompare(b.professionalName ?? '')
	})

	return { slots: allSlots }
}

// ─── Court Slots ────────────────────────────────────────────────────────────

async function getCourtSlots(params: {
	orgId: string
	date: string
	dayOfWeek: number
	businessDay: BusinessHourEntry
	dayStart: Date
	dayEnd: Date
	courtId?: string
	courtsRepo: CourtsRepository
	bookingsRepo: BookingsRepository
}): Promise<{ slots: TimeSlot[] }> {
	const {
		orgId,
		date,
		dayOfWeek,
		businessDay,
		dayStart,
		dayEnd,
		courtId,
		courtsRepo,
		bookingsRepo,
	} = params

	// 1. Get courts (filter by id if specified)
	let courts = await courtsRepo.list(orgId)
	courts = courts.filter((c) => c.isActive)
	if (courtId) {
		courts = courts.filter((c) => c.id === courtId)
	}

	if (courts.length === 0) return { slots: [] }

	// 2. Business hours window
	const businessStart = parseTime(businessDay.openTime, date)
	const businessEnd = parseTime(businessDay.closeTime, date)

	// 3. Get all bookings for this date range
	const allBookings = await bookingsRepo.listByDateRange(orgId, dayStart, dayEnd, {
		courtId: courtId,
	})

	const allSlots: TimeSlot[] = []

	for (const court of courts) {
		// Get court's operating hours for this day (fall back to business hours)
		const operatingHours = (court.operatingHours as BusinessHourEntry[] | null)?.find(
			(oh) => oh.dayOfWeek === dayOfWeek
		)

		// Determine effective work window
		let effectiveStart = businessStart
		let effectiveEnd = businessEnd

		if (operatingHours) {
			if (!operatingHours.isOpen) continue
			const courtStart = parseTime(operatingHours.openTime, date)
			const courtEnd = parseTime(operatingHours.closeTime, date)
			const intersection = intersectTimeRanges(businessStart, businessEnd, courtStart, courtEnd)
			if (!intersection) continue
			effectiveStart = intersection.start
			effectiveEnd = intersection.end
		}

		// Generate slots based on court configuration
		const slotDuration = court.slotDurationMinutes
		const breakBetween = court.breakBetweenMinutes
		const slots = generateSlots(effectiveStart, effectiveEnd, slotDuration, breakBetween)

		// Get bookings for this court
		const courtBookings = allBookings.filter((b) => b.dimCourtId === court.id)

		// Filter available slots
		for (const slot of slots) {
			if (isSlotAvailable(slot.start, slot.end, courtBookings)) {
				allSlots.push({
					startTime: slot.start.toISOString(),
					endTime: slot.end.toISOString(),
					courtId: court.id,
					courtName: court.name,
				})
			}
		}
	}

	// Sort by start time, then by court name
	allSlots.sort((a, b) => {
		const timeDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
		if (timeDiff !== 0) return timeDiff
		return (a.courtName ?? '').localeCompare(b.courtName ?? '')
	})

	return { slots: allSlots }
}

// ─── Main Service ───────────────────────────────────────────────────────────

export function getAvailableSlotsService(deps: {
	professionalsRepo: ProfessionalsRepository
	professionalServicesRepo: ProfessionalServicesRepository
	servicesRepo: ServicesRepository
	courtsRepo: CourtsRepository
	bookingsRepo: BookingsRepository
}) {
	const { professionalsRepo, professionalServicesRepo, servicesRepo, courtsRepo, bookingsRepo } =
		deps

	return async (input: GetAvailableSlotsInput): Promise<{ slots: TimeSlot[] }> => {
		const { orgId, orgBusinessHours, date, professionalId, serviceId, courtId, businessType } =
			input

		Logger.info('Getting available slots', {
			orgId,
			date,
			businessType,
			professionalId,
			serviceId,
			courtId,
		})

		if (!orgBusinessHours || orgBusinessHours.length === 0) {
			Logger.warn('No business hours configured', { orgId })
			return { slots: [] }
		}

		const targetDate = new Date(`${date}T00:00:00`)
		const dayOfWeek = targetDate.getDay()

		// Check if business is open on this day
		const businessDay = orgBusinessHours.find((h) => h.dayOfWeek === dayOfWeek)
		if (!businessDay?.isOpen) {
			Logger.info('Business is closed on this day', { orgId, date, dayOfWeek })
			return { slots: [] }
		}

		// Get date boundaries for booking query
		const dayStart = new Date(`${date}T00:00:00`)
		const dayEnd = new Date(`${date}T23:59:59`)

		if (businessType === 'barbershop') {
			const result = await getBarbershopSlots({
				orgId,
				date,
				dayOfWeek,
				businessDay,
				dayStart,
				dayEnd,
				professionalId,
				serviceId,
				professionalsRepo,
				professionalServicesRepo,
				servicesRepo,
				bookingsRepo,
			})
			Logger.info('Barbershop slots generated', { orgId, date, slotCount: result.slots.length })
			return result
		}

		const result = await getCourtSlots({
			orgId,
			date,
			dayOfWeek,
			businessDay,
			dayStart,
			dayEnd,
			courtId,
			courtsRepo,
			bookingsRepo,
		})
		Logger.info('Court slots generated', { orgId, date, slotCount: result.slots.length })
		return result
	}
}
