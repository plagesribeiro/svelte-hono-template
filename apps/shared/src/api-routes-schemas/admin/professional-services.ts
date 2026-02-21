import { z } from 'zod'

const serviceObjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	durationMinutes: z.number(),
	price: z.number(),
	currency: z.string(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

const professionalServiceObjectSchema = z.object({
	id: z.string().uuid(),
	dimProfessionalId: z.string().uuid(),
	dimServiceId: z.string().uuid(),
	customDurationMinutes: z.number().nullable(),
	customPrice: z.number().nullable(),
	service: serviceObjectSchema,
})

export const listProfessionalServicesResponseSchema = z.array(professionalServiceObjectSchema)

export const linkProfessionalServiceRequestSchema = z.object({
	dimServiceId: z.string().uuid(),
	customDurationMinutes: z.number().optional(),
	customPrice: z.number().optional(),
})

export const linkProfessionalServiceResponseSchema = professionalServiceObjectSchema

export const unlinkProfessionalServiceResponseSchema = z.object({
	success: z.boolean(),
})
