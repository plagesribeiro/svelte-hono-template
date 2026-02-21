# apps/shared - Shared Types & Schemas

## Purpose

Zod schemas, TypeScript types, and utilities shared between `api` and `web`.

## Subpath Exports

Package uses subpath exports in `package.json`:
```typescript
import { schema } from 'shared/api-routes-schemas'
import { constant } from 'shared/constants'
```

When adding a new export path, update `exports` in `package.json`.

## Schema Naming

- Pattern: `[action][Entity][Request|Response]Schema`
- Example: `getProtectedRouteRequestSchema`, `getProtectedRouteResponseSchema`
- Location: `src/api-routes-schemas/[route-group]/index.ts`

## Adding Schemas

1. Create/update in `src/api-routes-schemas/[route-group]/`
2. Export from `src/api-routes-schemas/index.ts`
3. Use in both `api` (OpenAPI validation) and `web` (type inference)
