import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';
import { client, json } from '$lib/api.svelte';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		...buildClerkProps(locals.auth())
	};
};