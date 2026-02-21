import { OpenAPIHono } from '@hono/zod-openapi'
import {
	CreateProfessionalRoute,
	DeleteProfessionalRoute,
	GetProfessionalRoute,
	LinkProfessionalServiceRoute,
	ListProfessionalServicesRoute,
	ListProfessionalsRoute,
	UnlinkProfessionalServiceRoute,
	UpdateProfessionalRoute,
} from './professionals.route'

type WorkingHours = { dayOfWeek: number; openTime: string; closeTime: string; isOpen: boolean }[]

function formatProfessional(p: {
	id: string
	name: string
	phone: string | null
	email: string | null
	avatarUrl: string | null
	isActive: boolean
	workingHours: unknown
	createdAt: Date
	updatedAt: Date
}) {
	return {
		id: p.id,
		name: p.name,
		phone: p.phone,
		email: p.email,
		avatarUrl: p.avatarUrl,
		isActive: p.isActive,
		workingHours: (p.workingHours as WorkingHours | null) ?? null,
		createdAt: p.createdAt.toISOString(),
		updatedAt: p.updatedAt.toISOString(),
	}
}

export const professionalsRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(ListProfessionalsRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const professionals = await c.var.services.professionals.list(orgId)
		return c.json(professionals.map(formatProfessional))
	})
	.openapi(CreateProfessionalRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const body = c.req.valid('json')
		const professional = await c.var.services.professionals.create(orgId, body)
		return c.json(formatProfessional(professional))
	})
	.openapi(GetProfessionalRoute, async (c) => {
		const { id } = c.req.valid('param')
		const professional = await c.var.services.professionals.get(id)
		// Get linked services
		const linkedServices = await c.var.services.professionalServiceLinks.listByProfessional(id)
		const services = linkedServices.map((ls) => ({
			id: ls.service.id,
			name: ls.service.name,
			durationMinutes: ls.customDurationMinutes ?? ls.service.durationMinutes,
			price: ls.customPrice ?? ls.service.price,
			currency: ls.service.currency,
		}))
		return c.json({
			...formatProfessional(professional),
			services,
		})
	})
	.openapi(UpdateProfessionalRoute, async (c) => {
		const { id } = c.req.valid('param')
		const body = c.req.valid('json')
		const professional = await c.var.services.professionals.update(id, body)
		return c.json(formatProfessional(professional))
	})
	.openapi(DeleteProfessionalRoute, async (c) => {
		await c.var.services.professionals.delete(c.req.valid('param').id)
		return c.json({ success: true })
	})
	.openapi(ListProfessionalServicesRoute, async (c) => {
		const { id } = c.req.valid('param')
		const linkedServices = await c.var.services.professionalServiceLinks.listByProfessional(id)
		return c.json(linkedServices)
	})
	.openapi(LinkProfessionalServiceRoute, async (c) => {
		const { id } = c.req.valid('param')
		const body = c.req.valid('json')
		const linked = await c.var.services.professionalServiceLinks.link({
			dimProfessionalId: id,
			dimServiceId: body.dimServiceId,
			customDurationMinutes: body.customDurationMinutes,
			customPrice: body.customPrice,
		})
		return c.json(linked)
	})
	.openapi(UnlinkProfessionalServiceRoute, async (c) => {
		const { id, serviceId } = c.req.valid('param')
		const result = await c.var.services.professionalServiceLinks.unlink(id, serviceId)
		return c.json(result)
	})
