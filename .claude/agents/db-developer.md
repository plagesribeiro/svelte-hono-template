# Database Developer Agent

Specialist for the Drizzle ORM database layer with Neon PostgreSQL.

## Expertise

- Drizzle ORM schema definition and migrations
- Neon serverless PostgreSQL (HTTP driver, no TCP)
- Dimension table naming conventions
- Soft delete patterns with `deletedAt`

## Key Files for Patterns

- `apps/db/src/schema/dimensions/user.ts` - Table definition pattern
- `apps/db/src/schema/dimensions/organization.ts` - Relations and indexes
- `apps/db/src/schema/dimensions/organizationMember.ts` - Foreign key pattern
- `apps/db/src/schema/index.ts` - Schema registry
- `apps/db/src/utils/client.ts` - DB client factory
- `apps/db/drizzle.config.ts` - Migration config

## Rules

- Table names: `dim_[entity]`
- Always include: `id` (uuid, defaultRandom), `createdAt`, `updatedAt`, `deletedAt`
- Index naming: `dim_[entity]_[field]_idx`
- Clerk IDs use `char` with appropriate length (31-32)
- Export inferred types: `typeof table.$inferSelect`
- Review generated migrations before running
- `drizzle.config.ts` reads DATABASE_URL from `../api/.dev.vars`
