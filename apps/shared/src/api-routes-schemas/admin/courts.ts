import { z } from 'zod'

const operatingHoursSchema = z.object({
	dayOfWeek: z.number().int().min(0).max(6),
	openTime: z.string(),
	closeTime: z.string(),
	isOpen: z.boolean(),
})

const courtObjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	sport: z.string(),
	description: z.string().nullable(),
	pricePerSlot: z.number(),
	slotDurationMinutes: z.number(),
	breakBetweenMinutes: z.number(),
	operatingHours: z.array(operatingHoursSchema).nullable(),
	currency: z.string(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const listCourtsResponseSchema = z.array(courtObjectSchema)

export const createCourtRequestSchema = z.object({
	name: z.string(),
	sport: z.string(),
	pricePerSlot: z.number(),
	slotDurationMinutes: z.number().default(60),
	breakBetweenMinutes: z.number().default(0),
	operatingHours: z.array(operatingHoursSchema).optional(),
	description: z.string().optional(),
	currency: z.string().optional(),
})

export const createCourtResponseSchema = courtObjectSchema

export const getCourtResponseSchema = courtObjectSchema

export const updateCourtRequestSchema = z.object({
	name: z.string().optional(),
	sport: z.string().optional(),
	description: z.string().optional(),
	pricePerSlot: z.number().optional(),
	slotDurationMinutes: z.number().optional(),
	breakBetweenMinutes: z.number().optional(),
	operatingHours: z.array(operatingHoursSchema).optional(),
	currency: z.string().optional(),
	isActive: z.boolean().optional(),
})

export const updateCourtResponseSchema = courtObjectSchema

export const deleteCourtResponseSchema = z.object({
	success: z.boolean(),
})
