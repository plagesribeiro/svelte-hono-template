import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const clerkAuth = locals.auth();
    const isSignOutRoute = url.pathname.includes('/sign-out');
	const redirectUrl = decodeURIComponent(url.searchParams.get('redirect_url') ?? '/');
	console.log("redirectUrl", redirectUrl);

	if (clerkAuth.userId && !isSignOutRoute) {
		return redirect(301, redirectUrl);
	}

	return {
		redirectUrl
	}
};