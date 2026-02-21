import { OpenAPIHono } from '@hono/zod-openapi'
import {
	CancelBookingRoute,
	CreateBookingRoute,
	GetBookingRoute,
	ListBookingsRoute,
} from './bookings.route'

export const bookingsRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(ListBookingsRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const query = c.req.valid('query')

		const result = await c.var.services.bookings.list(orgId, {
			startDate: query.startDate,
			endDate: query.endDate,
			status: query.status,
			professionalId: query.professionalId,
			courtId: query.courtId,
			page: query.page,
			limit: query.limit,
		})

		return c.json(result)
	})
	.openapi(GetBookingRoute, async (c) => {
		const { id } = c.req.valid('param')
		const booking = await c.var.services.bookings.getById(id)
		return c.json(booking)
	})
	.openapi(CreateBookingRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const body = c.req.valid('json')

		const booking = await c.var.services.bookings.create(orgId, {
			dimClientId: body.dimClientId,
			dimProfessionalId: body.dimProfessionalId,
			dimServiceId: body.dimServiceId,
			dimCourtId: body.dimCourtId,
			startTime: body.startTime,
			endTime: body.endTime,
			priceCharged: body.priceCharged,
			notes: body.notes,
		})

		return c.json(booking)
	})
	.openapi(CancelBookingRoute, async (c) => {
		const { id } = c.req.valid('param')
		const body = c.req.valid('json')

		const booking = await c.var.services.bookings.cancel(id, body.cancelReason)
		return c.json(booking)
	})
