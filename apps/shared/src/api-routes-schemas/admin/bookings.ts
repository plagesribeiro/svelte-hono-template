import { z } from 'zod'

const bookingObjectSchema = z.object({
	id: z.string().uuid(),
	dimOrganizationId: z.string().uuid(),
	dimClientId: z.string().uuid(),
	dimProfessionalId: z.string().uuid().nullable(),
	dimServiceId: z.string().uuid().nullable(),
	dimCourtId: z.string().uuid().nullable(),
	startTime: z.string(),
	endTime: z.string(),
	status: z.string(),
	priceCharged: z.number().nullable(),
	notes: z.string().nullable(),
	cancelledAt: z.string().nullable(),
	cancelReason: z.string().nullable(),
	version: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	clientName: z.string().optional(),
	professionalName: z.string().optional(),
	serviceName: z.string().optional(),
	courtName: z.string().optional(),
})

export const listBookingsRequestSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	status: z.string().optional(),
	professionalId: z.string().optional(),
	courtId: z.string().optional(),
	page: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
})

export const listBookingsResponseSchema = z.object({
	data: z.array(bookingObjectSchema),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
})

export const getBookingResponseSchema = bookingObjectSchema

export const createBookingRequestSchema = z.object({
	dimClientId: z.string().uuid(),
	dimProfessionalId: z.string().uuid().optional(),
	dimServiceId: z.string().uuid().optional(),
	dimCourtId: z.string().uuid().optional(),
	startTime: z.string(),
	endTime: z.string(),
	priceCharged: z.number().optional(),
	notes: z.string().optional(),
})

export const createBookingResponseSchema = bookingObjectSchema

export const cancelBookingRequestSchema = z.object({
	cancelReason: z.string().optional(),
})

export const cancelBookingResponseSchema = bookingObjectSchema
