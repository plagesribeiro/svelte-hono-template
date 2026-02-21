import { z } from 'zod'

const businessHoursSchema = z.object({
	dayOfWeek: z.number().int().min(0).max(6),
	openTime: z.string(),
	closeTime: z.string(),
	isOpen: z.boolean(),
})

export const getOrganizationResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	businessType: z.string(),
	businessHours: z.array(businessHoursSchema).nullable(),
	timezone: z.string().nullable(),
	phone: z.string().nullable(),
	address: z.string().nullable(),
	logoUrl: z.string().nullable(),
	chatWelcomeMessage: z.string().nullable(),
	chatInstructions: z.string().nullable(),
	onboardingCompleted: z.boolean(),
	email: z.string().nullable(),
	description: z.string().nullable(),
})

export const updateOrganizationRequestSchema = z.object({
	slug: z.string().optional(),
	businessHours: z.array(businessHoursSchema).optional(),
	timezone: z.string().optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	logoUrl: z.string().optional(),
	chatWelcomeMessage: z.string().optional(),
	chatInstructions: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
})

export const updateOrganizationResponseSchema = getOrganizationResponseSchema

export const completeOnboardingRequestSchema = z.object({
	businessType: z.enum(['barbershop', 'court']),
	slug: z.string(),
	businessHours: z.array(businessHoursSchema),
	name: z.string(),
	chatWelcomeMessage: z.string().optional(),
})

export const completeOnboardingResponseSchema = getOrganizationResponseSchema
