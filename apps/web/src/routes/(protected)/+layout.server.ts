import { redirect } from '@sveltejs/kit'
import { client, json } from '$lib/api.svelte'

export const load = async ({ locals, url }) => {
	const clerkAuth = locals.auth()

	if (!clerkAuth.userId) {
		const tryingToAccess = encodeURIComponent(url.pathname + url.search)
		return redirect(301, `/sign-in?redirect_url=${tryingToAccess}`)
	}

	// User is signed in but has no org yet — can only see the onboarding gate
	if (!clerkAuth.orgId) {
		if (!url.pathname.startsWith('/onboarding')) {
			return redirect(302, '/onboarding')
		}
		return {
			userClerkId: clerkAuth.userId,
			organization: null,
			hasOrg: false,
		}
	}

	// Org exists — fetch organization data for the admin layout
	try {
		const org = await json(client.admin.organization.$get())

		// Redirect to onboarding if not completed (unless already there)
		if (!org.onboardingCompleted && !url.pathname.startsWith('/onboarding')) {
			return redirect(302, '/onboarding')
		}

		// Redirect away from onboarding if already completed
		if (org.onboardingCompleted && url.pathname.startsWith('/onboarding')) {
			return redirect(302, '/dashboard')
		}

		return {
			userClerkId: clerkAuth.userId,
			organization: org,
			hasOrg: true,
		}
	} catch {
		// If org fetch fails (new org, ensureSync hasn't run yet), redirect to onboarding
		if (!url.pathname.startsWith('/onboarding')) {
			return redirect(302, '/onboarding')
		}
		return {
			userClerkId: clerkAuth.userId,
			organization: null,
			hasOrg: true,
		}
	}
}
