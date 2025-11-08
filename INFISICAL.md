# Infisical Secret Management

This project uses [Infisical](https://infisical.com) for centralized secret management across all environments.

## Table of Contents

- [Why Infisical?](#why-infisical)
- [Setup for Developers](#setup-for-developers)
- [Managing Secrets](#managing-secrets)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Why Infisical?

- **Centralized Management**: All secrets stored in one secure location
- **Environment Separation**: Different secrets for development, staging, and production
- **No Secrets in Code**: Eliminates the risk of committing secrets to git
- **Audit Trail**: Track who accessed or modified secrets
- **Easy Rotation**: Update secrets without changing code
- **Team Collaboration**: Share secrets securely across the team

## Setup for Developers

### 1. Get Access to Infisical Project

Contact your team lead to get added to the Infisical project at https://app.infisical.com

### 2. Install Infisical CLI

**macOS/Linux:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install infisical
```

**Windows (PowerShell):**
```powershell
scoop bucket add org https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

**Alternative (npm):**
```bash
npm install -g @infisical/cli
```

### 3. Login to Infisical

```bash
infisical login
```

This will open a browser window for authentication.

### 4. Initialize Infisical in Your Project

In the project root directory:

```bash
cd C:\Users\Administrador\Documents\Pessoal\Projetos\svelte-hono-template
infisical init
```

Select your project from the list.

### 5. Run Commands with Secrets

Instead of using `.dev.vars` files, run commands through Infisical:

```bash
# Run development server with secrets injected
infisical run --env=development -- pnpm dev

# Run specific package
infisical run --env=development -- pnpm --filter=api dev

# Run tests
infisical run --env=production -- pnpm test

# Generate database migrations
infisical run --env=development -- pnpm --filter=db db:generate
```

### 6. Quick Setup Script

Add these aliases to your shell profile for convenience:

```bash
# .bashrc or .zshrc
alias pnpm-dev="infisical run --env=development -- pnpm"
alias pnpm-test="infisical run --env=production -- pnpm"
```

Then use:
```bash
pnpm-dev dev
pnpm-test test
```

## Managing Secrets

### Current Secrets Structure

Our project uses the following secrets across environments:

#### Required for All Environments:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook validation secret
- `INTERNAL_ADMIN_API_KEY` - Internal API authentication key
- `INTERNAL_ADMIN_CLERK_USER_ID` - Admin user ID
- `INTERNAL_ADMIN_CLERK_ORG_ID` - Admin organization ID

#### Additional Secrets (add as needed):
- `CLOUDFLARE_API_TOKEN` - For Cloudflare Workers deployment
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier
- `APIFY_API_TOKEN` - Apify service token
- `ANTHROPIC_API_KEY` - Claude API key

### Environment Structure

- **`development`**: For local development
- **`staging`**: For staging deployments (if applicable)
- **`production`**: For production deployments and CI/CD tests

### Adding New Secrets

1. Go to https://app.infisical.com
2. Navigate to your project
3. Select the environment (development/staging/production)
4. Click "Add Secret"
5. Enter the key name and value
6. Save

**Important:** Add the same secret key to all environments, but with environment-specific values.

### Viewing Secrets Locally

```bash
# View secrets for development environment
infisical secrets

# View secrets for specific environment
infisical secrets --env=production

# Export secrets to .env file (for debugging)
infisical export --env=development > .env.local
```

## CI/CD Integration

### GitHub Actions

Secrets are automatically injected into GitHub Actions using the Infisical secrets-action.

**Required GitHub Secrets:**
- `INFISICAL_CLIENT_ID` - Machine Identity Client ID
- `INFISICAL_CLIENT_SECRET` - Machine Identity Client Secret
- `INFISICAL_PROJECT_SLUG` - Project identifier

These are managed by your DevOps team. Contact them if you need to update these values.

### How It Works

The workflow file (`.github/workflows/ci.yml`) includes:

```yaml
- name: Inject secrets from Infisical
  uses: Infisical/secrets-action@v1.0.7
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    env-slug: production
    project-slug: ${{ secrets.INFISICAL_PROJECT_SLUG }}
```

All secrets are then available as environment variables in subsequent steps.

## Troubleshooting

### "Command not found: infisical"

**Solution:** Install the Infisical CLI (see Setup step 2)

### "Authentication required"

**Solution:** Run `infisical login` to authenticate

### "Project not found"

**Solution:**
1. Make sure you've been added to the project in Infisical
2. Run `infisical init` and select the correct project
3. Verify `.infisical.json` exists in your project root

### "Environment variable not found in runtime"

**Solution:**
1. Check if the secret exists in Infisical for the correct environment
2. Verify you're using the right environment flag: `--env=development` or `--env=production`
3. Ensure the secret key matches exactly (case-sensitive)

### "Permission denied" in Infisical

**Solution:** Contact your team lead to grant you the necessary permissions in Infisical

### Local Development Without Infisical CLI

If you can't use the Infisical CLI, you can still use traditional `.dev.vars` files:

1. Copy `.dev.vars.example` to `.dev.vars`
2. Get secret values from a team member or Infisical UI
3. Fill in the values
4. Run commands normally: `pnpm dev`

**Note:** Never commit `.dev.vars` to git!

## Best Practices

1. **Always use Infisical** for running commands locally
2. **Never hardcode secrets** in code or configuration files
3. **Use environment-specific** values (don't share production secrets in development)
4. **Rotate secrets regularly** especially after team member changes
5. **Document new secrets** by updating this file when adding new secret keys
6. **Use descriptive names** for secret keys (e.g., `CLERK_SECRET_KEY` not `KEY1`)

## Support

- **Infisical Documentation**: https://infisical.com/docs
- **Infisical Discord**: https://infisical.com/discord
- **Internal Support**: Contact your team lead or DevOps team
