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

export const listServicesResponseSchema = z.array(serviceObjectSchema)

export const createServiceRequestSchema = z.object({
	name: z.string(),
	durationMinutes: z.number(),
	price: z.number(),
	description: z.string().optional(),
	currency: z.string().default('BRL'),
	isActive: z.boolean().optional(),
})

export const createServiceResponseSchema = serviceObjectSchema

export const getServiceResponseSchema = serviceObjectSchema

export const updateServiceRequestSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	durationMinutes: z.number().optional(),
	price: z.number().optional(),
	currency: z.string().optional(),
	isActive: z.boolean().optional(),
})

export const updateServiceResponseSchema = serviceObjectSchema

export const deleteServiceResponseSchema = z.object({
	success: z.boolean(),
})
