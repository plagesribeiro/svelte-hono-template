import { clerkMiddleware } from '@hono/clerk-auth'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth.middleware'
import { dbMiddleware } from './middleware/db.middleware'
import { ensureSyncMiddleware } from './middleware/ensure-sync.middleware'
import { servicesMiddleware } from './middleware/services.middleware'
import { availabilityRoutes } from './routes/admin/availability/availability.index'
import { bookingsRoutes } from './routes/admin/bookings/bookings.index'
import { clientsRoutes } from './routes/admin/clients/clients.index'
import { courtsRoutes } from './routes/admin/courts/courts.index'
import { organizationRoutes } from './routes/admin/organization/organization.index'
import { professionalsRoutes } from './routes/admin/professionals/professionals.index'
import { servicesRoutes } from './routes/admin/services/services.index'
import { clerkWebhookRouter } from './routes/clerkWebhook/clerkWebhook.index'
import { protectedRoutes as protectedRoutesIndex } from './routes/protected/protected.index'
import { publicChatRoutes } from './routes/public/chat/chat.index'
import { Logger } from './utils/logger'
import { createOpenAPIApp } from './utils/openapi'

const app = createOpenAPIApp()
app.use(cors())
app.use(clerkMiddleware())

app.onError((err, c) => {
	Logger.error('[Error] Error:', err instanceof Error ? err : new Error(String(err)))
	return c.json(
		{
			success: false,
			message: `Internal server error: ${err instanceof Error ? err.message : String(err)}`,
		},
		500
	)
})

const publicRoutes = app
	.get('/favicon.ico', (c) => c.body(null, 204))
	.get('/robots.txt', (c) => c.text('User-agent: *\nDisallow:', 404))
	.get('/apple-touch-icon.png', (c) => c.body(null, 204))
	.get('/apple-touch-icon-precomposed.png', (c) => c.body(null, 204))
	.get('/whoami', async (c) => {
		const auth = c.var.clerkAuth()
		const userId = auth?.userId

		return c.json({
			userRef: userId ? userId : 'Unknown Unauthenticated User',
		})
	})

const webhookRoutes = publicRoutes.route('/clerkWebhook', clerkWebhookRouter)

// Public chat routes - no auth required, but need db + services
const publicChatBase = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
publicChatBase.use(dbMiddleware())
publicChatBase.use(servicesMiddleware())

const withPublicChat = webhookRoutes.route(
	'/public',
	publicChatBase.route('/chat', publicChatRoutes)
)

app.use(authMiddleware())

const protectedRoutes = withPublicChat.route('/protected', protectedRoutesIndex)

// Admin routes - auth + db + services + ensure-sync required
const adminBase = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
adminBase.use(dbMiddleware())
adminBase.use(servicesMiddleware())
adminBase.use(ensureSyncMiddleware())

const allRoutes = protectedRoutes.route(
	'/admin',
	adminBase
		.route('/organization', organizationRoutes)
		.route('/professionals', professionalsRoutes)
		.route('/services', servicesRoutes)
		.route('/courts', courtsRoutes)
		.route('/bookings', bookingsRoutes)
		.route('/clients', clientsRoutes)
		.route('/availability', availabilityRoutes)
)

export default {
	fetch: app.fetch,
}

export type ServerType = typeof allRoutes
