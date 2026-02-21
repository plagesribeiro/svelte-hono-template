import { createRoute, z } from '@hono/zod-openapi'
import {
	createServiceRequestSchema,
	createServiceResponseSchema,
	deleteServiceResponseSchema,
	getServiceResponseSchema,
	listServicesResponseSchema,
	updateServiceRequestSchema,
	updateServiceResponseSchema,
} from 'shared/api-routes-schemas'

const idParam = z.object({ id: z.string().uuid() })

export const ListServicesRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Services'],
	responses: {
		200: {
			content: { 'application/json': { schema: listServicesResponseSchema } },
			description: 'List of services',
		},
	},
})

export const CreateServiceRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Admin - Services'],
	request: {
		body: { content: { 'application/json': { schema: createServiceRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: createServiceResponseSchema } },
			description: 'Created service',
		},
	},
})

export const GetServiceRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Admin - Services'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: getServiceResponseSchema } },
			description: 'Service details',
		},
	},
})

export const UpdateServiceRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Admin - Services'],
	request: {
		params: idParam,
		body: { content: { 'application/json': { schema: updateServiceRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: updateServiceResponseSchema } },
			description: 'Updated service',
		},
	},
})

export const DeleteServiceRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Admin - Services'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: deleteServiceResponseSchema } },
			description: 'Service deleted',
		},
	},
})
