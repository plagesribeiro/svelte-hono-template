/// <reference types="svelte-clerk/env" />
declare global {
	namespace App {
		interface Platform {
			env: {
				PUBLIC_CLERK_PUBLISHABLE_KEY: string
				CLERK_SECRET_KEY: string
				PUBLIC_SERVER_URL: string
			}
		}
	}
}

export {}
