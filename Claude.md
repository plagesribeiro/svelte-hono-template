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

### Development Tools
- **Linter/Formatter**: Biome 2.3.4 (with Svelte support)
- **Testing**: Vitest 3.2.4 with Cloudflare Workers pool
- **Git Hooks**: Husky 9.1.7
- **Commit Linting**: Commitlint with conventional commits
- **CI/CD**: GitHub Actions with Turborepo Remote Cache support

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

### Secret Management with Infisical

This project uses **Infisical** for centralized secret management across all environments. See [`INFISICAL.md`](./INFISICAL.md) for complete setup instructions.

#### Quick Start with Infisical

1. **Install Infisical CLI** (one-time setup):
```bash
# macOS/Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install infisical

# Windows (PowerShell with Scoop)
scoop bucket add org https://github.com/Infisical/scoop-infisical.git
scoop install infisical

# Alternative (npm)
npm install -g @infisical/cli
```

2. **Login and Initialize**:
```bash
infisical login
infisical init
```

3. **Choose Your Workflow**:

**Option A: Export to Files** (for offline work or when you prefer files):
```bash
# Export API secrets
infisical export --env=development --path=/api --format=dotenv > apps/api/.dev.vars

# Export Web secrets
infisical export --env=development --path=/web --format=dotenv > apps/web/.env.local

# Then run normally
pnpm dev
```

**Option B: Runtime Injection** (recommended - no files needed):
```bash
# Run API with secrets injected
infisical run --env=development --path=/api -- pnpm --filter=api dev

# Run Web with secrets injected
infisical run --env=development --path=/web -- pnpm --filter=web dev
```

#### Secret Organization

Secrets are organized by application in Infisical:
- **`/api` path**: Backend API secrets (DATABASE_URL, CLERK_SECRET_KEY, etc.)
- **`/web` path**: Frontend Web secrets (PUBLIC_CLERK_PUBLISHABLE_KEY, etc.)

#### Benefits of Using Infisical

- **Centralized management** - All secrets in one secure location
- **Environment separation** - Different secrets for dev/staging/prod
- **Team collaboration** - Share secrets securely without copy-paste
- **Audit trail** - Track who accessed secrets
- **Easy rotation** - Update secrets in one place
- **Easy setup** - One command generates all needed files

#### Fallback: Traditional .dev.vars (if not using Infisical)

If you prefer traditional environment files:

1. Copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars`
2. Fill in your secret values
3. Run commands normally: `pnpm dev`

**Note**: `.dev.vars` and `.env` files are gitignored and should never be committed.

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

## Development Tooling & Quality Assurance

### Linting & Formatting with Biome

The project uses **Biome 2.3.4** for ultra-fast linting and formatting with experimental Svelte support.

**Configuration**: `biome.json` at repository root

**Features**:
- Lints JavaScript, TypeScript, JSON, and Svelte files
- Auto-formatting on save
- Git integration (respects .gitignore)
- Consistent code style across the monorepo

**Commands**:
```bash
pnpm lint              # Check for issues
pnpm lint:fix          # Fix issues automatically
pnpm format            # Check formatting
pnpm format:fix        # Format all files
```

**Pre-commit Hook**: Biome runs automatically on staged files before each commit.

### Type Checking

TypeScript checking is configured across all packages with **shared base configurations**.

**Shared Config**: `packages/tsconfig/` contains base configurations:
- `base.json` - Strict TypeScript settings for all packages
- `cloudflare-workers.json` - Cloudflare Workers-specific settings
- `sveltekit.json` - SvelteKit-specific settings

**Package-specific configurations**:
- `apps/api/tsconfig.json` - Extends cloudflare-workers.json
- `apps/web/tsconfig.json` - Uses SvelteKit generated config with strict settings
- `apps/db/tsconfig.json` - Extends base.json
- `apps/shared/tsconfig.json` - Extends base.json

**Commands**:
```bash
pnpm typecheck         # Check types across all packages (uses Turborepo)
```

**Turborepo Integration**: Type checking is cached and runs in parallel across packages for performance.

### Testing with Vitest

The API uses **Vitest 3.2.4** with **@cloudflare/vitest-pool-workers** for testing in a Cloudflare Workers environment.

**Configuration**: `apps/api/vitest.config.ts`

**Test Structure**:
- Unit tests for services: `apps/api/src/services/**/*.test.ts`
- Service logic is tested with mocked repositories
- Coverage reporting with v8 provider

**Commands**:
```bash
# From root
pnpm test                           # Run all tests

# From api package
pnpm --filter=api test              # Run tests once
pnpm --filter=api test:watch        # Run tests in watch mode
pnpm --filter=api test:coverage     # Run tests with coverage report
```

**Example Test**: See `apps/api/src/services/organizations/upsert-organization-from-clerk.test.ts` for a comprehensive service test example.

**Best Practices**:
- Test service logic, not framework code
- Mock external dependencies (database, APIs)
- Use descriptive test names
- Group related tests with `describe` blocks
- Test both success and error paths

### Git Hooks with Husky

**Pre-commit Hook** (`.husky/pre-commit`):
- Runs Biome check on staged files with auto-fix
- Runs type checking across all packages
- Fast (typically 5-30 seconds)

**Commit Message Hook** (`.husky/commit-msg`):
- Enforces conventional commit format
- Uses commitlint with @commitlint/config-conventional

**Conventional Commit Format**:
```
type(scope): subject

feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
style: format code with biome
refactor: simplify user service logic
perf: optimize database queries
test: add tests for organization service
build: update dependencies
ci: fix GitHub Actions workflow
chore: update gitignore
```

**Allowed Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

### CI/CD with GitHub Actions

**Workflow**: `.github/workflows/ci.yml`

**Pipeline Stages**:

1. **Install** - Install dependencies with pnpm (cached)
2. **Lint** - Run Biome checks (parallel with typecheck and test)
3. **Type Check** - Run TypeScript checks across all packages (parallel)
4. **Test** - Run Vitest tests with coverage (parallel)
5. **Build** - Build all packages (after all checks pass)
6. **Deploy** - Deploy API to Cloudflare Workers (only on main branch)

**Key Features**:
- Parallel job execution for speed
- Turborepo caching for incremental builds
- Coverage upload to Codecov
- Concurrency groups (cancels outdated runs)
- Build artifact upload

**Caching Strategies**:
- pnpm store caching (automatic with setup-node)
- Turborepo cache (local .turbo directory)
- Optional: Turborepo Remote Cache (requires TURBO_TOKEN and TURBO_TEAM)

**Required Secrets** (for deployment):
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for deployment
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CODECOV_TOKEN` - Codecov token for coverage reporting (optional)

**Optional Variables** (for remote caching):
- `TURBO_TOKEN` - Vercel token for Turborepo Remote Cache
- `TURBO_TEAM` - Vercel team slug

**Setting up Turborepo Remote Cache**:
1. Sign up for free Vercel account
2. Run `pnpm dlx turbo login` and authenticate
3. Run `pnpm dlx turbo link` to link repository
4. Add `TURBO_TOKEN` and `TURBO_TEAM` to GitHub repository secrets/variables
5. Remote caching will dramatically speed up CI builds

**Manual Pre-commit Check**:
```bash
pnpm precommit         # Run lint + typecheck manually
```

## Common Commands Reference

```bash
# Installation
pnpm install

# Development (all apps)
pnpm dev                        # Starts all apps (builds dependencies first)
turbo dev

# Development (specific app)
turbo dev --filter=web
turbo dev --filter=api

# Build (all)
pnpm build                      # Builds all packages (runs typecheck first)
turbo build

# Build (specific)
turbo build --filter=api

# Linting & Formatting
pnpm lint                       # Check for linting issues
pnpm lint:fix                   # Fix linting issues automatically
pnpm format                     # Check formatting
pnpm format:fix                 # Format all files

# Type Checking
pnpm typecheck                  # Check TypeScript types across all packages

# Testing
pnpm test                       # Run all tests
pnpm --filter=api test          # Run API tests
pnpm --filter=api test:watch    # Run API tests in watch mode
pnpm --filter=api test:coverage # Run tests with coverage

# Pre-commit Check (manual)
pnpm precommit                  # Run lint + typecheck manually

# Database operations
pnpm --filter=db db:generate    # Generate migrations
pnpm --filter=db db:migrate     # Run migrations
pnpm --filter=db db:studio      # Open Drizzle Studio

# Run Wrangler commands
pnpm --filter=api cf-typegen    # Generate TypeScript types for bindings

# Infisical (Secret Management) - Native Commands
infisical login                 # Login to Infisical
infisical init                  # Initialize/link project

# Export secrets to files (when needed)
infisical export --env=development --path=/api --format=dotenv > apps/api/.dev.vars
infisical export --env=development --path=/web --format=dotenv > apps/web/.env.local

# Run commands with secrets injected (recommended)
infisical run --env=development --path=/api -- pnpm --filter=api dev
infisical run --env=development --path=/web -- pnpm --filter=web dev
infisical run --env=production --path=/api -- pnpm test

# View secrets
infisical secrets --env=development --path=/api
infisical secrets --env=development --path=/web
```

**Note:** Deployment to Cloudflare Workers is handled automatically within Cloudflare's deployment pipeline (not via `pnpm deploy`).

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

### Infisical CLI not found

**Solution:**
1. Install Infisical CLI (see installation instructions in [INFISICAL.md](./INFISICAL.md))
2. Verify installation: `infisical --version`
3. If using npm install, ensure npm global bin is in your PATH

### Infisical authentication fails

**Solution:**
1. Run `pnpm infisical:login` to authenticate
2. Ensure you have access to the project in Infisical
3. Contact your team lead if you need to be added to the project

### Environment variables not loading from Infisical

**Solution:**
1. Verify `.infisical.json` exists in project root
2. Run `pnpm infisical:init` to reinitialize
3. Check you're using the correct environment: `--env=development` or `--env=production`
4. Verify secrets exist in Infisical web UI: https://app.infisical.com

### GitHub Actions failing with "INFISICAL_CLIENT_ID not found"

**Solution:**
1. Ensure GitHub repository secrets are set:
   - `INFISICAL_CLIENT_ID`
   - `INFISICAL_CLIENT_SECRET`
   - `INFISICAL_PROJECT_SLUG`
2. Contact DevOps/Admin to configure these secrets

## Resources

- [Turborepo Docs](https://turborepo.com/docs)
- [Hono Docs](https://hono.dev/)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Clerk Docs](https://clerk.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
