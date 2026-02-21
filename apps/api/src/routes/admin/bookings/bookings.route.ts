import { createRoute, z } from '@hono/zod-openapi'
import {
	cancelBookingRequestSchema,
	cancelBookingResponseSchema,
	createBookingRequestSchema,
	createBookingResponseSchema,
	getBookingResponseSchema,
	listBookingsRequestSchema,
	listBookingsResponseSchema,
} from 'shared/api-routes-schemas'

const idParam = z.object({ id: z.string().uuid() })

export const ListBookingsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Bookings'],
	request: {
		query: listBookingsRequestSchema,
	},
	responses: {
		200: {
			content: { 'application/json': { schema: listBookingsResponseSchema } },
			description: 'List of bookings',
		},
	},
})

export const GetBookingRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Admin - Bookings'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: getBookingResponseSchema } },
			description: 'Booking details',
		},
	},
})

export const CreateBookingRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Admin - Bookings'],
	request: {
		body: { content: { 'application/json': { schema: createBookingRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: createBookingResponseSchema } },
			description: 'Created booking',
		},
	},
})

export const CancelBookingRoute = createRoute({
	method: 'post',
	path: '/{id}/cancel',
	tags: ['Admin - Bookings'],
	request: {
		params: idParam,
		body: { content: { 'application/json': { schema: cancelBookingRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: cancelBookingResponseSchema } },
			description: 'Cancelled booking',
		},
	},
})
