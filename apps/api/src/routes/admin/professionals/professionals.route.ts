import { createRoute, z } from '@hono/zod-openapi'
import {
	createProfessionalRequestSchema,
	createProfessionalResponseSchema,
	deleteProfessionalResponseSchema,
	getProfessionalResponseSchema,
	linkProfessionalServiceRequestSchema,
	linkProfessionalServiceResponseSchema,
	listProfessionalServicesResponseSchema,
	listProfessionalsResponseSchema,
	unlinkProfessionalServiceResponseSchema,
	updateProfessionalRequestSchema,
	updateProfessionalResponseSchema,
} from 'shared/api-routes-schemas'

const idParam = z.object({ id: z.string().uuid() })
const serviceIdParam = z.object({
	id: z.string().uuid(),
	serviceId: z.string().uuid(),
})

export const ListProfessionalsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Admin - Professionals'],
	responses: {
		200: {
			content: { 'application/json': { schema: listProfessionalsResponseSchema } },
			description: 'List of professionals',
		},
	},
})

export const CreateProfessionalRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Admin - Professionals'],
	request: {
		body: { content: { 'application/json': { schema: createProfessionalRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: createProfessionalResponseSchema } },
			description: 'Created professional',
		},
	},
})

export const GetProfessionalRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Admin - Professionals'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: getProfessionalResponseSchema } },
			description: 'Professional details',
		},
	},
})

export const UpdateProfessionalRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Admin - Professionals'],
	request: {
		params: idParam,
		body: { content: { 'application/json': { schema: updateProfessionalRequestSchema } } },
	},
	responses: {
		200: {
			content: { 'application/json': { schema: updateProfessionalResponseSchema } },
			description: 'Updated professional',
		},
	},
})

export const DeleteProfessionalRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Admin - Professionals'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: deleteProfessionalResponseSchema } },
			description: 'Professional deleted',
		},
	},
})

// Professional-Service link routes
export const ListProfessionalServicesRoute = createRoute({
	method: 'get',
	path: '/{id}/services',
	tags: ['Admin - Professionals'],
	request: { params: idParam },
	responses: {
		200: {
			content: { 'application/json': { schema: listProfessionalServicesResponseSchema } },
			description: 'List of services linked to professional',
		},
	},
})

export const LinkProfessionalServiceRoute = createRoute({
	method: 'post',
	path: '/{id}/services',
	tags: ['Admin - Professionals'],
	request: {
		params: idParam,
		body: {
			content: { 'application/json': { schema: linkProfessionalServiceRequestSchema } },
		},
	},
	responses: {
		200: {
			content: { 'application/json': { schema: linkProfessionalServiceResponseSchema } },
			description: 'Service linked to professional',
		},
	},
})

export const UnlinkProfessionalServiceRoute = createRoute({
	method: 'delete',
	path: '/{id}/services/{serviceId}',
	tags: ['Admin - Professionals'],
	request: { params: serviceIdParam },
	responses: {
		200: {
			content: { 'application/json': { schema: unlinkProfessionalServiceResponseSchema } },
			description: 'Service unlinked from professional',
		},
	},
})
