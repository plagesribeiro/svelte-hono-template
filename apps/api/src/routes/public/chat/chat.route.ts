import { createRoute, z } from '@hono/zod-openapi'
import {
	createChatSessionResponseSchema,
	getTenantInfoResponseSchema,
	sendChatMessageRequestSchema,
} from 'shared/api-routes-schemas'

export const GetTenantInfoRoute = createRoute({
	method: 'get',
	path: '/:slug/info',
	tags: ['Public - Chat'],
	request: {
		params: z.object({ slug: z.string() }),
	},
	responses: {
		200: {
			content: { 'application/json': { schema: getTenantInfoResponseSchema } },
			description: 'Tenant info for the chat widget',
		},
		404: {
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
			description: 'Organization not found',
		},
	},
})

export const CreateChatSessionRoute = createRoute({
	method: 'post',
	path: '/:slug/session',
	tags: ['Public - Chat'],
	request: {
		params: z.object({ slug: z.string() }),
	},
	responses: {
		200: {
			content: { 'application/json': { schema: createChatSessionResponseSchema } },
			description: 'Chat session created',
		},
		404: {
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
			description: 'Organization not found',
		},
	},
})

export const SendChatMessageRoute = createRoute({
	method: 'post',
	path: '/:slug/message',
	tags: ['Public - Chat'],
	request: {
		params: z.object({ slug: z.string() }),
		body: {
			content: { 'application/json': { schema: sendChatMessageRequestSchema } },
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.object({ response: z.string() }),
				},
			},
			description: 'Chat message response',
		},
		404: {
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
			description: 'Organization not found',
		},
		429: {
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
			description: 'Rate limit exceeded',
		},
		500: {
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
			description: 'AI service not configured',
		},
	},
})
