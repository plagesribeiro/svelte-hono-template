---
disable-model-invocation: true
description: Scaffold a new API route with shared schemas, OpenAPI definition, handler, and registration
---

# Add API Route

When the user invokes `/add-api-route`, follow these steps:

1. **Ask** for the route name, HTTP method, path, and whether it's protected or public.

2. **Create shared schemas** in `apps/shared/src/api-routes-schemas/[route-name]/index.ts`:
   - Request schema (query/body/params as needed)
   - Response schema
   - Follow naming: `[method][RouteName]RequestSchema`, `[method][RouteName]ResponseSchema`

3. **Export schemas** from `apps/shared/src/api-routes-schemas/index.ts`

4. **Create route definition** at `apps/api/src/routes/[name]/[name].route.ts`:
   - Use `createRoute()` from `@hono/zod-openapi`
   - Import schemas from `shared/api-routes-schemas`
   - Add appropriate OpenAPI tag

5. **Create route handler** at `apps/api/src/routes/[name]/[name].index.ts`:
   - Use `new OpenAPIHono().openapi(route, handler)`
   - Export the router
   - Access context via `c.var` (userData, db, services)

6. **Register route** in `apps/api/src/index.ts`:
   - Protected routes: AFTER `authMiddleware()`
   - Public routes: BEFORE `authMiddleware()`

7. **Verify**: Run `pnpm typecheck` to confirm no type errors.
