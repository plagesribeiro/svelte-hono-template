---
disable-model-invocation: true
description: Create a new service with repository, service function, tests, and wiring
---

# Add Service

When the user invokes `/add-service`, follow these steps:

1. **Ask** for the domain, action, and entity (e.g., domain=users, action=upsert, entity=user).

2. **Create/update repository** at `apps/api/src/repositories/[entity].repo.ts`:
   - Class-based with Drizzle queries
   - Always filter `isNull(deletedAt)` for reads
   - Use `onConflictDoUpdate` for upserts
   - Export type: `export type Entity = typeof dimEntityTable.$inferSelect`

3. **Create service function** at `apps/api/src/services/[domain]/[action]-[entity].ts`:
   - Factory pattern: `export function actionEntityService(repo) { return async (input) => { ... } }`
   - Keep business logic here, not in repos or routes

4. **Add to ServiceContainer**: Wire the service into the domain service class and `ServiceContainer`.

5. **Update services middleware** if needed: `apps/api/src/middleware/services.middleware.ts`

6. **Write tests** at `apps/api/src/services/[domain]/[action]-[entity].test.ts`:
   - Mock repositories
   - Test success and error paths
   - Use `describe` blocks and descriptive names

7. **Run tests**: `pnpm --filter=api test` to verify everything passes.
