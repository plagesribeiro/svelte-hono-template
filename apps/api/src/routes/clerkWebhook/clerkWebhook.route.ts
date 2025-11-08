import { createRoute } from '@hono/zod-openapi'
import { ClerkWebhookRequestSchema, ClerkWebhookResponseSchema } from 'shared/api-routes-schemas'

export const clerkWebhookRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Webhooks'],
	summary: 'Clerk webhook endpoint',
	description: 'Handles Clerk events for users, organizations, and organization memberships',
	request: {
		body: {
			content: {
				'application/json': {
					schema: ClerkWebhookRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Webhook processed successfully',
			content: {
				'application/json': {
					schema: ClerkWebhookResponseSchema,
				},
			},
		},
		400: {
			description: 'Bad request - missing data, unknown event type, or webhook verification failed',
			content: {
				'application/json': {
					schema: ClerkWebhookResponseSchema,
				},
			},
		},
		401: {
			description: 'Unauthorized - invalid webhook signature',
			content: {
				'application/json': {
					schema: ClerkWebhookResponseSchema,
				},
			},
		},
		500: {
			description: 'Internal server error - missing webhook secret configuration',
			content: {
				'application/json': {
					schema: ClerkWebhookResponseSchema,
				},
			},
		},
	},
})
