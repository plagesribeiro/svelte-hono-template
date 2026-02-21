import { OpenAPIHono } from '@hono/zod-openapi'
import {
	CompleteOnboardingRoute,
	GetOrganizationRoute,
	UpdateOrganizationRoute,
} from './organization.route'

function formatOrg(org: {
	id: string
	name: string
	slug: string | null
	businessType: string | null
	businessHours: unknown
	timezone: string | null
	phone: string | null
	address: string | null
	logoUrl: string | null
	chatWelcomeMessage: string | null
	chatInstructions: string | null
	onboardingCompleted: boolean | null
	email: string | null
	description: string | null
}) {
	return {
		id: org.id,
		name: org.name,
		slug: org.slug ?? '',
		businessType: org.businessType ?? '',
		businessHours:
			(org.businessHours as
				| { dayOfWeek: number; openTime: string; closeTime: string; isOpen: boolean }[]
				| null) ?? null,
		timezone: org.timezone,
		phone: org.phone,
		address: org.address,
		logoUrl: org.logoUrl,
		chatWelcomeMessage: org.chatWelcomeMessage,
		chatInstructions: org.chatInstructions,
		onboardingCompleted: org.onboardingCompleted ?? false,
		email: org.email,
		description: org.description,
	}
}

export const organizationRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
	.openapi(GetOrganizationRoute, async (c) => {
		const { clerkOrgId } = c.var.userData
		const org = await c.var.services.organizationConfig.get(clerkOrgId)
		return c.json(formatOrg(org))
	})
	.openapi(UpdateOrganizationRoute, async (c) => {
		const { clerkOrgId } = c.var.userData
		const body = c.req.valid('json')
		const org = await c.var.services.organizationConfig.update(clerkOrgId, body)
		return c.json(formatOrg(org))
	})
	.openapi(CompleteOnboardingRoute, async (c) => {
		const { clerkOrgId } = c.var.userData
		const body = c.req.valid('json')
		const org = await c.var.services.organizationConfig.completeOnboarding(clerkOrgId, body)
		return c.json(formatOrg(org))
	})
