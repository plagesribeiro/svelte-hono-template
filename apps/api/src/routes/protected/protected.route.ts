import { createRoute } from '@hono/zod-openapi'
import { getProtectedRouteRequestSchema, getProtectedRouteResponseSchema } from 'shared/api-routes-schemas'

export const GetProtectedRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Protected'],
  request: {
    query: getProtectedRouteRequestSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getProtectedRouteResponseSchema,
        },
      },
      description: 'Protected route',
    },
  },
})