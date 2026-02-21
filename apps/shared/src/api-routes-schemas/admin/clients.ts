import { z } from 'zod'

const clientObjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	phone: z.string(),
	email: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const listClientsRequestSchema = z.object({
	page: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	search: z.string().optional(),
})

export const listClientsResponseSchema = z.object({
	data: z.array(clientObjectSchema),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
})

export const getClientResponseSchema = clientObjectSchema
