import type { CloudflareBindings } from '../../../worker-configuration'

declare module 'cloudflare:test' {
	interface ProvidedEnv extends CloudflareBindings {}
}
