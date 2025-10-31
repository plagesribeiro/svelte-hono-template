import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client, json } from "$lib/api.svelte";

export const load: PageServerLoad = async () => {
	const whoami = await json(client.whoami.$get())

	return {
		whoami
	}
}

export const actions: Actions = {
	setTheme: async ({ url, cookies }) => {
		const theme = url.searchParams.get("theme");
		const redirectTo = url.searchParams.get("redirectTo");

		if (theme) {
			cookies.set("colortheme", theme, {
				path: "/",
				maxAge: 60 * 60 * 24 * 365,
			});
		}

		throw redirect(303, redirectTo ?? "/");
	},
};