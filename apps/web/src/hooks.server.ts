import { isolateLocals } from "$lib/utils/locals";
import type { Handle } from "@sveltejs/kit";
import { sequence } from '@sveltejs/kit/hooks'
import { withClerkHandler } from 'svelte-clerk/server';

export const handle = sequence(withClerkHandler(),
(async ({ event, resolve }) => {
    return await isolateLocals(event.locals, async () => await resolve(event))
}) satisfies Handle,
(async ({ event, resolve }) => {
	let theme: string | null = null;

	const newTheme = event.url.searchParams.get("theme");
	const cookieTheme = event.cookies.get("colortheme");

	if (newTheme) {
		theme = newTheme;
	} else if (cookieTheme) {
		theme = cookieTheme;
	} else {
		theme = "forest";
	}

	if (theme) {
		return await resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('data-theme=""', `data-theme="${theme}"`),
		});
	}

	return await resolve(event);
}) satisfies Handle);