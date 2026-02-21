import { OpenAPIHono } from '@hono/zod-openapi'
import { ChatRateLimitError, OrganizationNotFoundError } from '../../../context/errors'
import { CreateChatSessionRoute, GetTenantInfoRoute, SendChatMessageRoute } from './chat.route'

export const publicChatRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(GetTenantInfoRoute, async (c) => {
		const { slug } = c.req.valid('param')

		try {
			const org = await c.var.services.organizationConfig.getBySlug(slug)
			return c.json(
				{
					name: org.name,
					businessType: org.businessType ?? '',
					chatWelcomeMessage: org.chatWelcomeMessage,
					logoUrl: org.logoUrl,
				},
				200
			)
		} catch (error) {
			if (error instanceof OrganizationNotFoundError) {
				return c.json({ error: 'Organization not found' }, 404)
			}
			throw error
		}
	})
	.openapi(CreateChatSessionRoute, async (c) => {
		const { slug } = c.req.valid('param')

		try {
			const org = await c.var.services.organizationConfig.getBySlug(slug)
			const session = await c.var.services.chatSessionsRepository.create(org.id)
			return c.json({ sessionId: session.id }, 200)
		} catch (error) {
			if (error instanceof OrganizationNotFoundError) {
				return c.json({ error: 'Organization not found' }, 404)
			}
			throw error
		}
	})
	.openapi(SendChatMessageRoute, async (c) => {
		const { slug } = c.req.valid('param')
		const { message, sessionId } = c.req.valid('json')

		if (!c.env.ANTHROPIC_API_KEY) {
			return c.json({ error: 'AI service not configured' }, 500)
		}

		try {
			const org = await c.var.services.organizationConfig.getBySlug(slug)
			const response = await c.var.services.chat.processMessage({
				sessionId,
				message,
				apiKey: c.env.ANTHROPIC_API_KEY,
				org: {
					id: org.id,
					name: org.name,
					businessType: org.businessType ?? 'barbershop',
					businessHours: org.businessHours,
					chatInstructions: org.chatInstructions,
				},
			})
			return c.json({ response }, 200)
		} catch (error) {
			if (error instanceof OrganizationNotFoundError) {
				return c.json({ error: 'Organization not found' }, 404)
			}
			if (error instanceof ChatRateLimitError) {
				return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429)
			}
			throw error
		}
	})
