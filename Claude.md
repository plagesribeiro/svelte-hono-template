# Svelte-Hono Template

Turborepo monorepo: `apps/api` (Hono on CF Workers), `apps/web` (SvelteKit 5), `apps/db` (Drizzle ORM + Neon), `apps/shared` (Zod schemas & types). Auth via Clerk. See per-app CLAUDE.md for details.

## Architecture

- **Layered API**: Routes -> Services -> Repositories -> Database
- **Type-safe client**: Zod schemas in `shared` -> OpenAPI routes in `api` -> `ServerType` export -> `hcWithType` in `web`
- **Middleware order** (critical): `cors()` -> `clerkMiddleware()` -> [public/webhook routes] -> `authMiddleware()` -> [protected routes + db + services middleware]
- **Soft deletes**: All entities use `deletedAt` timestamp, repos always filter `isNull(deletedAt)`

## Naming Conventions

| What | Pattern | Example |
|------|---------|---------|
| Route files | `[name].route.ts` + `[name].index.ts` | `protected.route.ts` |
| DB tables | `dim_[entity]` | `dim_user`, `dim_organization` |
| Services | `[action]-[entity].ts` | `upsert-user-from-clerk.ts` |
| Repositories | `[entity].repo.ts` | `users.repo.ts` |
| Shared schemas | `[action][Entity][Request\|Response]Schema` | `getProtectedRouteRequestSchema` |
| Commits | Conventional commits | `feat:`, `fix:`, `refactor:` |

## Imports

- Workspace packages: `import { x } from 'shared/api-routes-schemas'`, `import { x } from 'db/schema'`
- Internal: relative paths `import { x } from './middleware/auth.middleware'`

## Key Commands

```bash
pnpm dev                        # Start all apps (API :8080, Web :5173)
pnpm build                      # Build all
pnpm test                       # Run all tests
pnpm typecheck                  # TypeScript check all packages
pnpm lint:fix                   # Biome lint + fix
pnpm format:fix                 # Biome format

pnpm --filter=db db:generate    # Generate DB migrations
pnpm --filter=db db:migrate     # Run migrations
pnpm --filter=db db:studio      # Drizzle Studio GUI
pnpm --filter=api cf-typegen    # Regenerate CF Worker types
```

## Env Setup

- API secrets: `apps/api/.dev.vars` (or use Infisical, see INFISICAL.md)
- Web secrets: `apps/web/.env` (needs `PUBLIC_` prefix for client vars)
- DB config reads `DATABASE_URL` from `apps/api/.dev.vars`

## Workflow: Add API Route

1. Define Zod schemas in `apps/shared/src/api-routes-schemas/[route]/`
2. Export from `apps/shared/src/api-routes-schemas/index.ts`
3. Create `apps/api/src/routes/[name]/[name].route.ts` (OpenAPI definition)
4. Create `apps/api/src/routes/[name]/[name].index.ts` (handler)
5. Register in `apps/api/src/index.ts` (before or after `authMiddleware()`)
6. Run `pnpm typecheck`

## Workflow: Add DB Table

1. Create schema in `apps/db/src/schema/dimensions/[name].ts` (use `dim_` prefix, include timestamps)
2. Export from `apps/db/src/schema/index.ts`
3. Run `pnpm --filter=db db:generate` then review migration
4. Run `pnpm --filter=db db:migrate`

## Workflow: Add Service

1. Create/update repo in `apps/api/src/repositories/[entity].repo.ts`
2. Create service function in `apps/api/src/services/[domain]/[action]-[entity].ts`
3. Add to `ServiceContainer` in `apps/api/src/services/`
4. Wire in `apps/api/src/middleware/services.middleware.ts`
5. Write tests in `apps/api/src/services/[domain]/[name].test.ts`
6. Run `pnpm test`
