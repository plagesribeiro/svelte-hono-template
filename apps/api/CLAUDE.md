# apps/api - Hono API (Cloudflare Workers)

## Middleware Chain (order matters!)

```
cors() -> clerkMiddleware() -> [webhooks] -> authMiddleware() -> dbMiddleware() -> servicesMiddleware() -> [protected routes]
```

- Webhook routes go BEFORE `authMiddleware()` (they use Svix verification)
- Protected routes go AFTER `authMiddleware()`
- `authMiddleware` injects `userData` into context: `clerkUserId`, `clerkOrgId`, `clerkRole`
- `dbMiddleware` injects `db` (Drizzle client)
- `servicesMiddleware` injects `services` (ServiceContainer)

## Route File Pattern

Each route lives in `src/routes/[name]/` with two files:
- `[name].route.ts` - OpenAPI definition using `createRoute()`, imports schemas from `shared`
- `[name].index.ts` - Handler using `new OpenAPIHono().openapi(route, handler)`, exports router

Register router in `src/index.ts` via `.route('/path', router)`.

## Service Pattern

Factory function returning async handler:
```typescript
export function actionEntityService(repo: Repo) {
  return async (input: Input) => { /* logic */ }
}
```
Domain services grouped in classes (e.g., `OrganizationService`) that compose individual service functions. All wired through `ServiceContainer`.

## Repository Pattern

Class-based, wraps Drizzle queries. Always filter `isNull(deletedAt)` for soft deletes. Use `onConflictDoUpdate` for upserts on Clerk IDs.

## Context Variables

Access via `c.var`: `userData` (auth), `db` (drizzle client), `services` (ServiceContainer)

## Testing

```bash
pnpm --filter=api test              # Run once
pnpm --filter=api test:watch        # Watch mode
pnpm --filter=api test:coverage     # With coverage
```

Uses Vitest + `@cloudflare/vitest-pool-workers`. Tests in `src/services/**/*.test.ts`. Mock repos, test service logic.
