---
disable-model-invocation: true
description: Create a new database table with Drizzle schema, migration, and exports
---

# Add Database Table

When the user invokes `/add-db-table`, follow these steps:

1. **Ask** for the entity name and columns needed.

2. **Create schema** at `apps/db/src/schema/dimensions/[entity].ts`:
   - Table name: `dim_[entity]`
   - Primary key: `uuid('id').primaryKey().defaultRandom().notNull()`
   - Required timestamps: `createdAt` (defaultNow, notNull), `updatedAt` (defaultNow, notNull), `deletedAt` (nullable)
   - Add indexes with naming pattern `dim_[entity]_[field]_idx`
   - Export the table and inferred types

3. **Export** from `apps/db/src/schema/index.ts` - add to the schema registry.

4. **Generate migration**: Run `pnpm --filter=db db:generate`

5. **Review** the generated migration in `apps/db/migrations/` and show it to the user.

6. **Run migration** (with user confirmation): `pnpm --filter=db db:migrate`

7. **Verify**: Run `pnpm typecheck` to confirm no type errors.
