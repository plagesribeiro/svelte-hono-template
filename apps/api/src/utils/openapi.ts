import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

export function createOpenAPIApp() {
	const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info: {
			title: 'My Template API',
			version: '1.0.0',
			description: 'API for My Template',
		},
		security: [{ Bearer: [] }],
		servers: [
			{
				url: 'http://localhost:8080',
				description: 'Local development',
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
