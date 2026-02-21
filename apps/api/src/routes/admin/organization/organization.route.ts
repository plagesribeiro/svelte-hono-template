import { createRoute } from '@hono/zod-openapi'
import {
	completeOnboardingRequestSchema,
	completeOnboardingResponseSchema,
	getOrganizationResponseSchema,
	updateOrganizationRequestSchema,
	updateOrganizationResponseSchema,
} from 'shared/api-routes-schemas'

export const GetOrganizationRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Organization'],
	responses: {
		200: {
			content: { 'application/json': { schema: getOrganizationResponseSchema } },
			description: 'Organization details',
		},
	},
})

export const UpdateOrganizationRoute = createRoute({
	method: 'put',
	path: '/',
	tags: ['Admin - Organization'],
	request: {
		body: { content: { 'application/json': { schema: updateOrganizationRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: updateOrganizationResponseSchema } },
			description: 'Updated organization',
		},
	},
})

export const CompleteOnboardingRoute = createRoute({
	method: 'put',
	path: '/onboarding',
	tags: ['Admin - Organization'],
	request: {
		body: { content: { 'application/json': { schema: completeOnboardingRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: completeOnboardingResponseSchema } },
			description: 'Onboarding completed',
		},
	},
})
