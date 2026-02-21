import { createRoute, z } from '@hono/zod-openapi'
import {
	createCourtRequestSchema,
	createCourtResponseSchema,
	deleteCourtResponseSchema,
	getCourtResponseSchema,
	listCourtsResponseSchema,
	updateCourtRequestSchema,
	updateCourtResponseSchema,
} from 'shared/api-routes-schemas'

const idParam = z.object({ id: z.string().uuid() })

export const ListCourtsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Courts'],
	responses: {
		200: {
			content: { 'application/json': { schema: listCourtsResponseSchema } },
			description: 'List of courts',
		},
	},
})

export const CreateCourtRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Admin - Courts'],
	request: {
		body: { content: { 'application/json': { schema: createCourtRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: createCourtResponseSchema } },
			description: 'Created court',
		},
	},
})

export const GetCourtRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Admin - Courts'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: getCourtResponseSchema } },
			description: 'Court details',
		},
	},
})

export const UpdateCourtRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Admin - Courts'],
	request: {
		params: idParam,
		body: { content: { 'application/json': { schema: updateCourtRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: updateCourtResponseSchema } },
			description: 'Updated court',
		},
	},
})

export const DeleteCourtRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Admin - Courts'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: deleteCourtResponseSchema } },
			description: 'Court deleted',
		},
	},
})
