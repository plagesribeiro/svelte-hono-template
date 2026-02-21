import { z } from 'zod'

export const getAvailableSlotsRequestSchema = z.object({
	date: z.string(),
	professionalId: z.string().optional(),
	serviceId: z.string().optional(),
	courtId: z.string().optional(),
})

export const getAvailableSlotsResponseSchema = z.object({
	slots: z.array(
		z.object({
			startTime: z.string(),
			endTime: z.string(),
			professionalId: z.string().optional(),
			professionalName: z.string().optional(),
			courtId: z.string().optional(),
			courtName: z.string().optional(),
		})
	),
})
