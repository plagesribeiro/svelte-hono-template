import { createRoute } from '@hono/zod-openapi'
import {
	getAvailableSlotsRequestSchema,
	getAvailableSlotsResponseSchema,
} from 'shared/api-routes-schemas'

export const GetAvailableSlotsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Availability'],
	request: {
		query: getAvailableSlotsRequestSchema,
	},
	responses: {
		200: {
			content: { 'application/json': { schema: getAvailableSlotsResponseSchema } },
			description: 'Available time slots',
		},
	},
})
