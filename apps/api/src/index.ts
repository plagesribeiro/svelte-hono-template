import { clerkMiddleware } from '@hono/clerk-auth'
import { authMiddleware } from './middleware/auth.middleware'
import { protectedRoutes as protectedRoutesIndex } from './routes/protected/protected.index'
import { createOpenAPIApp } from './utils/openapi'
import { cors } from 'hono/cors'
import { clerkWebhookRouter } from './routes/clerkWebhook/clerkWebhook.index'
import { Logger } from './utils/logger'

const app = createOpenAPIApp()
app.use(cors())
app.use(clerkMiddleware())

app.onError((err, c) => {
    Logger.error('[Error] Error:', err instanceof Error ? err : new Error(String(err)))
    return c.json({ success: false, message: `Internal server error: ${err instanceof Error ? err.message : String(err)}` }, 500)
})

const publicRoutes = app
    .get('/favicon.ico', (c) => c.body(null, 204))
    .get('/robots.txt', (c) => c.text('User-agent: *\nDisallow:', 404))
    .get('/apple-touch-icon.png', (c) => c.body(null, 204))
    .get('/apple-touch-icon-precomposed.png', (c) => c.body(null, 204))


const webhookRoutes = publicRoutes.route('/clerkWebhook', clerkWebhookRouter)

app.use(authMiddleware())

const protectedRoutes = webhookRoutes.route('/protected', protectedRoutesIndex)

export default {
  fetch: app.fetch
}

export type ServerType = typeof protectedRoutes