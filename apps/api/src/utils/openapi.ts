import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

export function createOpenAPIApp() {
	const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info: {
			title: 'UaiBook API',
			version: '1.0.0',
			description: 'API for UaiBook - Multi-tenant scheduling platform',
		},
		security: [{ Bearer: [] }],
		servers: [
			{
				url: 'http://localhost:8080',
				description: 'Local development',
			},
			{
				url: 'https://api-staging.uaibook.com',
				description: 'Staging',
			},
			{
				url: 'https://api.uaibook.com',
				description: 'Production',
			},
		],
		tags: [
			{
				name: 'Public',
				description: 'Public endpoints',
			},
			{
				name: 'Protected',
				description: 'Protected endpoints',
			},
			{
				name: 'Admin - Organization',
				description: 'Organization management endpoints',
			},
			{
				name: 'Admin - Professionals',
				description: 'Professional management endpoints',
			},
			{
				name: 'Admin - Services',
				description: 'Service management endpoints',
			},
			{
				name: 'Admin - Courts',
				description: 'Court management endpoints',
			},
			{
				name: 'Admin - Clients',
				description: 'Client management endpoints',
			},
			{
				name: 'Admin - Bookings',
				description: 'Booking management endpoints',
			},
			{
				name: 'Admin - Availability',
				description: 'Availability management endpoints',
			},
			{
				name: 'Public - Chat',
				description: 'Public chat endpoints',
			},
		],
	})

	// Swagger UI
	app.get('/docs', swaggerUI({ url: '/openapi.json' }))

	// Register security scheme
	app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
		type: 'http',
		scheme: 'bearer',
		in: 'header',
		name: 'Authorization',
		bearerFormat: 'JWT',
		description: 'Clerk JWT token or API token',
	})

	// Health check endpoint (no auth required)
	app.openapi(
		createRoute({
			method: 'get',
			path: '/ping',
			summary: 'Health check',
			description: 'Returns pong if service is healthy',
			tags: ['System'],
			responses: {
				200: {
					description: 'Service is healthy',
					content: {
						'text/plain': {
							schema: z.literal('pong!'),
						},
					},
				},
			},
		}),
		(c) => {
			return c.text('pong!')
		}
	)

	return app
}
