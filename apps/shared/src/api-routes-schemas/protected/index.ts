import { z } from 'zod'

export const getProtectedRouteRequestSchema = z.object({
	param_1: z.string(),
})

export const getProtectedRouteResponseSchema = z.object({
	message: z.string(),
	success: z.boolean(),
})
