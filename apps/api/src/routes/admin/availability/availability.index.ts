import { OpenAPIHono } from '@hono/zod-openapi'
import type { BusinessHourEntry } from '../../../services/availability/get-available-slots'
import { GetAvailableSlotsRoute } from './availability.route'

export const availabilityRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>().openapi(
	GetAvailableSlotsRoute,
	async (c) => {
		const { clerkOrgId } = c.var.userData
		const { date, professionalId, serviceId, courtId } = c.req.valid('query')

		// Resolve org and get business details
		const org = await c.var.services.organizationConfig.get(clerkOrgId)

		const result = await c.var.services.availability.getAvailableSlots({
			orgId: org.id,
			orgBusinessHours: (org.businessHours as BusinessHourEntry[] | null) ?? null,
			date,
			professionalId,
			serviceId,
			courtId,
			businessType: org.businessType ?? 'barbershop',
		})

		return c.json(result)
	}
)
