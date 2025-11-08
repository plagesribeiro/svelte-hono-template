import { createMiddleware } from 'hono/factory'
import { ServiceContainer } from '../utils/services'

declare module 'hono' {
	interface ContextVariableMap {
		services: ServiceContainer
	}
}

export function servicesMiddleware() {
	return createMiddleware<{
		Bindings: CloudflareBindings
	}>(async (c, next) => {
		const db = c.var.db

		const services = new ServiceContainer(db, c.env, c.var.clerk)

		c.set('services', services)

		await next()
	})
}
