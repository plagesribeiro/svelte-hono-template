import { OpenAPIHono } from '@hono/zod-openapi'
import {
	CreateCourtRoute,
	DeleteCourtRoute,
	GetCourtRoute,
	ListCourtsRoute,
	UpdateCourtRoute,
} from './courts.route'

type OperatingHours = { dayOfWeek: number; openTime: string; closeTime: string; isOpen: boolean }[]

function formatCourt(c: {
	id: string
	name: string
	sport: string
	description: string | null
	pricePerSlot: number
	slotDurationMinutes: number
	breakBetweenMinutes: number
	operatingHours: unknown
	currency: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}) {
	return {
		id: c.id,
		name: c.name,
		sport: c.sport,
		description: c.description,
		pricePerSlot: c.pricePerSlot,
		slotDurationMinutes: c.slotDurationMinutes,
		breakBetweenMinutes: c.breakBetweenMinutes,
		operatingHours: (c.operatingHours as OperatingHours | null) ?? null,
		currency: c.currency,
		isActive: c.isActive,
		createdAt: c.createdAt.toISOString(),
		updatedAt: c.updatedAt.toISOString(),
	}
}

export const courtsRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(ListCourtsRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const courts = await c.var.services.courts.list(orgId)
		return c.json(courts.map(formatCourt))
	})
	.openapi(CreateCourtRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const body = c.req.valid('json')
		const court = await c.var.services.courts.create(orgId, body)
		return c.json(formatCourt(court))
	})
	.openapi(GetCourtRoute, async (c) => {
		const { id } = c.req.valid('param')
		const court = await c.var.services.courts.get(id)
		return c.json(formatCourt(court))
	})
	.openapi(UpdateCourtRoute, async (c) => {
		const { id } = c.req.valid('param')
		const body = c.req.valid('json')
		const court = await c.var.services.courts.update(id, body)
		return c.json(formatCourt(court))
	})
	.openapi(DeleteCourtRoute, async (c) => {
		await c.var.services.courts.delete(c.req.valid('param').id)
		return c.json({ success: true })
	})
