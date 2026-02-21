import { createRoute, z } from '@hono/zod-openapi'
import {
	getClientResponseSchema,
	listClientsRequestSchema,
	listClientsResponseSchema,
} from 'shared/api-routes-schemas'

const idParam = z.object({ id: z.string().uuid() })

export const ListClientsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Clients'],
	request: {
		query: listClientsRequestSchema,
	},
	responses: {
		200: {
			content: { 'application/json': { schema: listClientsResponseSchema } },
			description: 'List of clients',
		},
	},
})

export const GetClientRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Admin - Clients'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: getClientResponseSchema } },
			description: 'Client details',
		},
	},
})
