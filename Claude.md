# Svelte-Hono Template - Developer Guide

## Project Overview

This is a **Turborepo monorepo** template for building full-stack applications with:
- **Frontend**: SvelteKit 5 with TailwindCSS 4 and DaisyUI
- **Backend**: Hono API running on Cloudflare Workers
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk (integrated on both frontend and backend)

The repository uses **pnpm workspaces** and is organized into 4 main packages:

```
apps/
├── api/       # Hono API (Cloudflare Workers)
├── web/       # SvelteKit frontend
├── db/        # Database layer (Drizzle ORM)
└── shared/    # Shared types and schemas
```

## Tech Stack

### Core Technologies
- **Package Manager**: pnpm 10.17.1
- **Monorepo Tool**: Turborepo 2.5.8
- **Node Version**: >= 18
- **TypeScript**: 5.9.2

### Frontend (`apps/web`)
- **Framework**: SvelteKit 2 with Svelte 5
- **Styling**: TailwindCSS 4 + DaisyUI
- **Auth**: svelte-clerk
- **Build Tool**: Vite 7

### Backend (`apps/api`)
- **Framework**: Hono 4.10
- **Runtime**: Cloudflare Workers (Wrangler 4.4)
- **Auth**: @hono/clerk-auth
- **API Docs**: @hono/swagger-ui + @hono/zod-openapi
- **Validation**: Zod
- **Webhooks**: Svix (for Clerk webhooks)

### Database (`apps/db`)
- **ORM**: Drizzle ORM 0.44.7
- **Database**: Neon PostgreSQL
- **Client**: @neondatabase/serverless
- **Migrations**: Drizzle Kit

### Shared (`apps/shared`)
- **Validation**: Zod (shared schemas)
- **Purpose**: API route schemas, types, and utilities

## Architecture & Patterns

### Workspace Dependencies

The monorepo uses **workspace references** for internal packages:

```json
{
  "dependencies": {
    "api": "workspace:*",      // From apps/api
    "db": "workspace:*",        // From apps/db
    "shared": "workspace:*"     // From apps/shared
  }
}
```

### pnpm Catalog

Shared dependencies are managed via **pnpm catalog** (defined in `pnpm-workspace.yaml`):

```yaml
catalog:
  "zod": 4.1.12
  "drizzle-orm": 0.44.7
```

Use `"zod": "catalog:"` in package.json to reference catalog versions.

### Type-Safe API Client

The API exports a **type-safe RPC client** that the web app consumes:

1. **API** (`apps/api/src/index.ts`): Exports `ServerType` from the Hono app
2. **API Types** (`apps/api/src/types.ts`): Exports `hcWithType` helper for type-safe client
3. **Web Client** (`apps/web/src/lib/api.svelte.ts`): Creates typed client with auth

This enables **end-to-end type safety** from backend to frontend.

### Service-Repository Pattern

The API follows a **layered architecture**:

```
Routes → Services → Repositories → Database
```

- **Routes** (`apps/api/src/routes/`): OpenAPI route definitions
- **Services** (`apps/api/src/services/`): Business logic
- **Repositories** (`apps/api/src/repositories/`): Database queries
- **Middleware** (`apps/api/src/middleware/`): Auth, DB injection, etc.

### Middleware Pattern

The API uses **Hono middleware** for cross-cutting concerns:

1. **CORS**: Global CORS handling
2. **Clerk Middleware**: Authentication setup
3. **Auth Middleware**: Protects routes (after webhooks)
4. **DB Middleware**: Injects database client into context

Example from `apps/api/src/index.ts`:
```typescript
app.use(cors())
app.use(clerkMiddleware())
// ... public routes and webhooks ...
app.use(authMiddleware())  // All routes after this require auth
// ... protected routes ...
```

### OpenAPI Routes

All API routes use **@hono/zod-openapi** for:
- Automatic OpenAPI schema generation
- Runtime request/response validation
- Swagger UI documentation

Route definition pattern (`apps/api/src/routes/protected/protected.route.ts`):
```typescript
export const GetProtectedRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Protected'],
  request: {
    query: getProtectedRouteRequestSchema,  // From shared package
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getProtectedRouteResponseSchema,  // From shared package
        },
      },
      description: 'Protected route',
    },
  },
})
```

### Shared Schemas

API route schemas are defined in `apps/shared/src/api-routes-schemas/` and used by:
- **Backend**: For validation and OpenAPI generation
- **Frontend**: For type inference and validation

This ensures **contract consistency** between frontend and backend.

## Getting Started

### Installation

```bash
pnpm install
```

### Environment Setup

#### 1. Database Environment (`apps/api/.dev.vars`)

Create `apps/api/.dev.vars` for **Drizzle migrations**:

```env
DATABASE_URL=postgresql://user:pass@host/db
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

This file is also used by Wrangler for local development.

#### 2. Web Environment (`apps/web/.env`)

Create `apps/web/.env`:

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
PUBLIC_SERVER_URL=http://localhost:8080
```

### Development Commands

#### Start All Apps
```bash
pnpm dev
# or
turbo dev
```

This starts:
- API on `http://localhost:8080`
- Web on `http://localhost:5173` (default Vite port)

#### Start Specific App
```bash
turbo dev --filter=web
turbo dev --filter=api
```

#### Build All
```bash
pnpm build
# or
turbo build
```

#### Build Specific
```bash
turbo build --filter=api
```

### Database Operations

All database commands run from the `db` workspace:

```bash
# Generate migrations from schema changes
pnpm --filter=db db:generate

# Run migrations
pnpm --filter=db db:migrate

# Open Drizzle Studio (database GUI)
pnpm --filter=db db:studio
```

### API Deployment

Deploy the API to Cloudflare Workers:

```bash
pnpm --filter=api deploy
```

## Workspace Details

### `apps/api` - Hono API

**Purpose**: REST API with OpenAPI documentation, deployed to Cloudflare Workers.

**Key Files**:
- `src/index.ts` - Entry point, middleware setup, route registration
- `src/types.ts` - Type-safe client export
- `wrangler.jsonc` - Cloudflare Workers configuration
- `worker-configuration.d.ts` - TypeScript bindings for Cloudflare env

**Structure**:
```
src/
├── index.ts                      # App entry point
├── types.ts                      # Type exports
├── middleware/                   # Middleware functions
│   ├── auth.middleware.ts        # Clerk authentication
│   ├── db.middleware.ts          # Database injection
│   └── services.middleware.ts    # Service injection
├── routes/                       # API routes
│   ├── clerkWebhook/            # Clerk webhook handlers
│   └── protected/                # Protected routes (require auth)
├── services/                     # Business logic
├── repositories/                 # Database queries
└── utils/                        # Utilities (logger, OpenAPI helpers)
```

**Important Conventions**:
- Routes are grouped in folders with `.index.ts` (registration) and `.route.ts` (definition)
- Protected routes come after `authMiddleware()` in `index.ts`
- Webhook routes come before `authMiddleware()` (they have custom validation)

### `apps/web` - SvelteKit Frontend

**Purpose**: Frontend application with authentication and theme switching.

**Key Files**:
- `src/routes/+layout.svelte` - Root layout
- `src/routes/+layout.server.ts` - Server-side layout data
- `src/hooks.server.ts` - SvelteKit hooks (Clerk + theme handling)
- `src/lib/api.svelte.ts` - Type-safe API client
- `vite.config.ts` - Vite configuration
- `svelte.config.js` - SvelteKit configuration

**Structure**:
```
src/
├── app.html                     # HTML template
├── app.css                      # Global styles
├── hooks.server.ts              # Server hooks
├── routes/                      # File-based routing
│   ├── (auth)/                 # Auth routes (sign-in, sign-up, sign-out)
│   ├── (protected)/            # Protected routes (require auth)
│   ├── +layout.svelte          # Root layout
│   ├── +layout.server.ts       # Root layout data
│   └── +page.svelte            # Home page
└── lib/
    ├── api.svelte.ts           # API client
    ├── components/             # Reusable components
    └── utils/                  # Utilities
```

**Important Patterns**:
- Route groups use parentheses: `(auth)`, `(protected)`
- `hooks.server.ts` handles Clerk authentication and theme persistence
- API client automatically injects Clerk token in requests
- Theme is managed via cookies and DaisyUI data attributes

### `apps/db` - Database Layer

**Purpose**: Database schema, migrations, and client utilities.

**Key Files**:
- `src/index.ts` - Package exports
- `src/schema/index.ts` - Schema registry
- `src/utils/client.ts` - Database client factory
- `drizzle.config.ts` - Drizzle Kit configuration

**Structure**:
```
src/
├── index.ts                     # Exports
├── schema/
│   ├── index.ts                # Schema registry
│   └── dimensions/             # Dimension tables
│       ├── user.ts             # User table
│       ├── organization.ts     # Organization table
│       └── organizationMember.ts # Org membership table
└── utils/
    ├── client.ts               # DB client factory
    ├── withPagination.ts       # Pagination utility
    └── index.ts                # Utility exports
```

**Important Conventions**:
- Tables use **dimension table** naming pattern: `dim_user`, `dim_organization`
- All tables have `createdAt`, `updatedAt`, and `deletedAt` timestamps
- Foreign keys use Clerk IDs for user/organization references
- Indexes are defined for common lookups (Clerk IDs, emails, etc.)

**Environment Setup**:
- `drizzle.config.ts` reads `DATABASE_URL` from `../api/.dev.vars`
- This ensures migrations and local dev use the same database

### `apps/shared` - Shared Code

**Purpose**: Types, schemas, and utilities shared between frontend and backend.

**Key Files**:
- `src/index.ts` - Package exports
- `src/api-routes-schemas/` - API route request/response schemas
- `src/types/` - Shared TypeScript types
- `src/utils/` - Shared utilities

**Structure**:
```
src/
├── index.ts                     # Exports
├── api-routes-schemas/          # Zod schemas for API routes
│   ├── index.ts
│   ├── protected/              # Protected route schemas
│   └── clerkWebhook/           # Webhook schemas
├── types/                       # TypeScript types
│   └── ...
└── utils/                       # Shared utilities
    └── ...
```

**Export Pattern**:
The `shared` package uses **subpath exports** in `package.json`:

```json
{
  "exports": {
    "./api-routes-schemas": "./src/api-routes-schemas/index.ts",
    "./constants": "./src/constants/index.ts"
  }
}
```

Usage in other packages:
```typescript
import { schema } from 'shared/api-routes-schemas'
```

## Development Workflow

### Adding a New API Route

1. **Define schemas** in `apps/shared/src/api-routes-schemas/`
2. **Create route definition** in `apps/api/src/routes/[route-name]/[route-name].route.ts`
3. **Implement handler** in `apps/api/src/routes/[route-name]/[route-name].index.ts`
4. **Register route** in `apps/api/src/index.ts`
5. **Use in frontend** via the type-safe client in `apps/web/src/lib/api.svelte.ts`

### Adding a Database Table

1. **Define schema** in `apps/db/src/schema/dimensions/[table-name].ts`
2. **Export from** `apps/db/src/schema/index.ts`
3. **Generate migration**: `pnpm --filter=db db:generate`
4. **Review migration** in `apps/db/migrations/`
5. **Run migration**: `pnpm --filter=db db:migrate`

### Clerk Webhook Synchronization

The API automatically syncs Clerk users and organizations via webhooks:

- **User events**: `user.created`, `user.updated`, `user.deleted`
- **Org events**: `organization.created`, `organization.updated`, `organization.deleted`
- **Membership events**: `organizationMembership.created`, `organizationMembership.deleted`

Webhook handlers are in `apps/api/src/routes/clerkWebhook/`.

### Type-Safe API Calls

Frontend makes type-safe API calls using the Hono RPC client:

```typescript
import { client, json } from '$lib/api.svelte'

// Fully typed request and response
const response = await client.protected.$get({
  query: { foo: 'bar' }
})

if (response.ok) {
  const data = await json(response)  // Typed response data
  console.log(data)
}
```

## Key Conventions

### Import Paths

- **Workspace packages**: Import by package name
  ```typescript
  import { schema } from 'shared/api-routes-schemas'
  import { dimUserTable } from 'db/schema'
  ```

- **Internal files**: Use relative paths
  ```typescript
  import { authMiddleware } from './middleware/auth.middleware'
  ```

### File Naming

- **Routes**: `[name].route.ts` (OpenAPI definition) + `[name].index.ts` (handler registration)
- **Schemas**: `[table-name].ts` in `apps/db/src/schema/dimensions/`
- **Services**: `[action]-[entity].ts` (e.g., `upsert-user-from-clerk.ts`)
- **Repositories**: `[entity].repo.ts` (e.g., `users.repo.ts`)

### Code Organization

- **Middleware**: One middleware per file in `apps/api/src/middleware/`
- **Services**: Grouped by domain in `apps/api/src/services/[domain]/`
- **Repositories**: One repo per entity in `apps/api/src/repositories/`
- **Route groups**: Protected vs public routes separated in code

## Turbo Configuration

The `turbo.json` defines task dependencies:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["build/**", "dist/**"]
    },
    "dev": {
      "persistent": true,       // Keep running
      "cache": false            // Don't cache dev mode
    }
  }
}
```

**Task Dependencies**:
- `^build`: Run `build` in dependencies first
- `dependsOn`: Specify task order

## Important Notes

### Cloudflare Workers Considerations

- API runs on **Cloudflare Workers** (not Node.js)
- Use **Wrangler** for local development and deployment
- Environment variables are injected via **Cloudflare bindings**
- Database connection uses **Neon's serverless driver** (HTTP-based, no TCP)

### Type Safety Flow

```
1. Define Zod schemas in `shared` package
2. Use in API routes for validation + OpenAPI
3. Export API type via `ServerType` in `apps/api/src/index.ts`
4. Import in web app via `hcWithType` helper
5. Get full type safety from API to frontend
```

### Database Migrations

- Migrations are stored in `apps/db/migrations/`
- Drizzle reads schema from `apps/db/src/schema/`
- Configuration in `apps/db/drizzle.config.ts` points to `../api/.dev.vars` for `DATABASE_URL`
- Always review generated migrations before running

### Authentication Flow

1. **Frontend**: Clerk SDK handles sign-in/sign-up
2. **Frontend → API**: Clerk session token sent in `Authorization` header
3. **API**: `@hono/clerk-auth` validates token
4. **API**: Middleware injects `userClerkId` and `organizationId` into context
5. **API**: Protected routes access authenticated user info

### Theme Switching

- Themes are managed by **DaisyUI**
- Theme preference stored in **cookies**
- `hooks.server.ts` injects theme into HTML `data-theme` attribute
- Available themes: forest (default), plus all DaisyUI themes

## Common Commands Reference

```bash
# Installation
pnpm install

# Development (all apps)
pnpm dev
turbo dev

# Development (specific app)
turbo dev --filter=web
turbo dev --filter=api

# Build (all)
pnpm build
turbo build

# Build (specific)
turbo build --filter=api

# Database operations
pnpm --filter=db db:generate    # Generate migrations
pnpm --filter=db db:migrate     # Run migrations
pnpm --filter=db db:studio      # Open Drizzle Studio

# Deploy API
pnpm --filter=api deploy        # Deploy to Cloudflare

# Run Wrangler commands
pnpm --filter=api cf-typegen    # Generate TypeScript types for bindings
```

## Troubleshooting

### "DATABASE_URL is not set"

Ensure `apps/api/.dev.vars` exists with valid `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:pass@host/db
```

### Type errors in API client

1. Rebuild the API: `turbo build --filter=api`
2. Restart TypeScript server in your editor
3. Check that `apps/api/src/types.ts` exports `hcWithType` correctly

### Clerk authentication not working

1. Verify Clerk keys in both `apps/api/.dev.vars` and `apps/web/.env`
2. Ensure `PUBLIC_CLERK_PUBLISHABLE_KEY` has `PUBLIC_` prefix in web app
3. Check that API URL is correct in `PUBLIC_SERVER_URL`

### Database connection fails

1. Ensure database URL includes `?sslmode=require` for Neon
2. Verify Neon database is accessible from your location
3. Check that DATABASE_URL is set in Cloudflare Workers environment variables for production

## Resources

- [Turborepo Docs](https://turborepo.com/docs)
- [Hono Docs](https://hono.dev/)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Clerk Docs](https://clerk.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
