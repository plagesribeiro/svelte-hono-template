# apps/web - SvelteKit Frontend

## Stack

SvelteKit 2 + Svelte 5 (runes: `$state`, `$derived`, `$effect`), TailwindCSS 4 + DaisyUI, svelte-clerk for auth.

## Route Groups

- `(auth)/` - Sign-in, sign-up, sign-out pages
- `(protected)/` - Routes requiring authentication
- Layout: `+layout.svelte` (root), `+layout.server.ts` (server data)

## API Client

```typescript
import { client, json } from '$lib/api.svelte'
const res = await client.protected.$get({ query: { foo: 'bar' } })
if (res.ok) { const data = await json(res) }
```

Client auto-injects Clerk token via `Authorization` header. Type-safe end-to-end.

## Styling

- TailwindCSS 4 for utilities
- DaisyUI components and themes
- Theme stored in cookies, applied via `data-theme` attribute
- Default theme: `forest`

## Auth

- `hooks.server.ts` handles Clerk auth + theme persistence
- Use `svelte-clerk` components for auth UI
- Protected routes check auth in layout server load
