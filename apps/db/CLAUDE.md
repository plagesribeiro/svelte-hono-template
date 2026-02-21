# apps/db - Database Layer (Drizzle ORM + Neon)

## Table Conventions

- **Naming**: `dim_[entity]` (dimension tables)
- **Primary key**: `uuid('id').primaryKey().defaultRandom().notNull()`
- **Required timestamps**: `createdAt`, `updatedAt` (defaultNow, notNull), `deletedAt` (nullable, for soft delete)
- **Clerk refs**: `char('clerk_id', { length: 32 }).notNull().unique()`
- **Foreign keys**: UUID references via `.references(() => table.id)`
- **Index naming**: `dim_[table]_[field]_idx`

## Schema Location

- Tables: `src/schema/dimensions/[entity].ts`
- Registry: `src/schema/index.ts` (all tables exported here)
- Utilities: `src/utils/` (client factory, pagination)

## Config

`drizzle.config.ts` reads `DATABASE_URL` from `../api/.dev.vars`. Neon serverless driver (HTTP, no TCP).

## Commands

```bash
pnpm --filter=db db:generate    # Generate migration from schema changes
pnpm --filter=db db:migrate     # Apply migrations
pnpm --filter=db db:studio      # Open Drizzle Studio
```

Always review generated migrations in `migrations/` before running.
