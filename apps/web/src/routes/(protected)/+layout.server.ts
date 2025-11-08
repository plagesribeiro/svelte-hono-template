import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, url }) => {
	const clerkAuth = locals.auth()

	if (!clerkAuth.userId) {
		const tryingToAccess = encodeURIComponent(url.pathname + url.search)
		return redirect(301, `/sign-in?redirect_url=${tryingToAccess}`)
	}

	return {
		userClerkId: clerkAuth.userId,
	}
}
