import { z } from 'zod'

export const getTenantInfoResponseSchema = z.object({
	name: z.string(),
	businessType: z.string(),
	chatWelcomeMessage: z.string().nullable(),
	logoUrl: z.string().nullable(),
})

export const createChatSessionResponseSchema = z.object({
	sessionId: z.string(),
})

export const sendChatMessageRequestSchema = z.object({
	message: z.string(),
	sessionId: z.string(),
})
