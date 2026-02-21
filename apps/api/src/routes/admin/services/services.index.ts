import { OpenAPIHono } from '@hono/zod-openapi'
import {
	CreateServiceRoute,
	DeleteServiceRoute,
	GetServiceRoute,
	ListServicesRoute,
	UpdateServiceRoute,
} from './services.route'

function formatService(s: {
	id: string
	name: string
	description: string | null
	durationMinutes: number
	price: number
	currency: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}) {
	return {
		id: s.id,
		name: s.name,
		description: s.description,
		durationMinutes: s.durationMinutes,
		price: s.price,
		currency: s.currency,
		isActive: s.isActive,
		createdAt: s.createdAt.toISOString(),
		updatedAt: s.updatedAt.toISOString(),
	}
}

export const servicesRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(ListServicesRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const services = await c.var.services.serviceEntities.list(orgId)
		return c.json(services.map(formatService))
	})
	.openapi(CreateServiceRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const body = c.req.valid('json')
		const service = await c.var.services.serviceEntities.create(orgId, body)
		return c.json(formatService(service))
	})
	.openapi(GetServiceRoute, async (c) => {
		const { id } = c.req.valid('param')
		const service = await c.var.services.serviceEntities.get(id)
		return c.json(formatService(service))
	})
	.openapi(UpdateServiceRoute, async (c) => {
		const { id } = c.req.valid('param')
		const body = c.req.valid('json')
		const service = await c.var.services.serviceEntities.update(id, body)
		return c.json(formatService(service))
	})
	.openapi(DeleteServiceRoute, async (c) => {
		await c.var.services.serviceEntities.delete(c.req.valid('param').id)
		return c.json({ success: true })
	})
