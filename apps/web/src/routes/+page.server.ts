import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const clerkAuth = locals.auth()
	if (clerkAuth.userId) {
		return redirect(302, '/dashboard')
	}
	return {}
}

export const actions: Actions = {
	setTheme: async ({ url, cookies }) => {
		const theme = url.searchParams.get('theme')
		const redirectTo = url.searchParams.get('redirectTo')

		if (theme) {
			cookies.set('colortheme', theme, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
			})
		}

		throw redirect(303, redirectTo ?? '/')
	},
}
