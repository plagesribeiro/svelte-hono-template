import { type DbClient, getDbClient } from 'db'
import { createMiddleware } from 'hono/factory'
import { Logger } from '../utils/logger'

declare module 'hono' {
	interface ContextVariableMap {
		db: DbClient
	}
}

export function dbMiddleware() {
	return createMiddleware<{
		Bindings: CloudflareBindings
		Variables: {
			db: DbClient
			userClerkId: string
			organizationId: string
		}
	}>(async (c, next) => {
		try {
			const db = getDbClient(c.env.DATABASE_URL)
			c.set('db', db)
			await next()
		} catch (error) {
			Logger.error(
				'[DB Middleware] Error:',
				error instanceof Error ? error : new Error(String(error))
			)
			throw error
		}
	})
}
