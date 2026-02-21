import { OpenAPIHono } from '@hono/zod-openapi'
import { GetClientRoute, ListClientsRoute } from './clients.route'

export const clientsRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(ListClientsRoute, async (c) => {
		const orgId = await c.var.services.organizationConfig.resolveOrgId(c.var.userData.clerkOrgId)
		const query = c.req.valid('query')

		const result = await c.var.services.clients.list(orgId, {
			page: query.page,
			limit: query.limit,
			search: query.search,
		})

		return c.json(result)
	})
	.openapi(GetClientRoute, async (c) => {
		const { id } = c.req.valid('param')
		const client = await c.var.services.clients.getById(id)
		return c.json(client)
	})
