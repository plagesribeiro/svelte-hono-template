import { z } from 'zod'

const workingHoursSchema = z.object({
	dayOfWeek: z.number().int().min(0).max(6),
	openTime: z.string(),
	closeTime: z.string(),
	isOpen: z.boolean(),
})

const professionalObjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	isActive: z.boolean(),
	workingHours: z.array(workingHoursSchema).nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const listProfessionalsResponseSchema = z.array(professionalObjectSchema)

export const createProfessionalRequestSchema = z.object({
	name: z.string(),
	phone: z.string().optional(),
	email: z.string().optional(),
	avatarUrl: z.string().optional(),
	workingHours: z.array(workingHoursSchema).optional(),
	isActive: z.boolean().default(true),
})

export const createProfessionalResponseSchema = professionalObjectSchema

export const getProfessionalResponseSchema = professionalObjectSchema.extend({
	services: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			durationMinutes: z.number(),
			price: z.number(),
			currency: z.string(),
		})
	),
})

export const updateProfessionalRequestSchema = z.object({
	name: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	avatarUrl: z.string().optional(),
	workingHours: z.array(workingHoursSchema).optional(),
	isActive: z.boolean().optional(),
})

export const updateProfessionalResponseSchema = professionalObjectSchema

export const deleteProfessionalResponseSchema = z.object({
	success: z.boolean(),
})
