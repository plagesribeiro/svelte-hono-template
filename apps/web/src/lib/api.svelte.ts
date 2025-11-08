import { hcWithType, parseResponse } from 'api'
import { browser } from '$app/environment'
import { env } from '$env/dynamic/public'
import { getLocals } from './utils/locals'

const getToken = async () => {
	if (browser) {
		const token = await window.Clerk?.session?.getToken()
		if (token) {
			return token
		}
	} else {
		const locals = await getLocals()
		const token = await locals?.auth().getToken()
		if (token) {
			return token
		}
	}
}

export const client = hcWithType(env.PUBLIC_SERVER_URL!, {
	fetch: (async (input, init) => {
		if (init?.headers) {
			init.headers = new Headers(init.headers)

			const token = await getToken()
			if (token) {
				init.headers.append('Authorization', `Bearer ${token}`)
			}
		}

		const response = await fetch(input, init)

		return response
	}) as typeof fetch,
})

export const json = parseResponse
