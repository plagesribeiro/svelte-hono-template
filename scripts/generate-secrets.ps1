# Generate secrets from Infisical to local environment files
# PowerShell version for Windows

$ErrorActionPreference = "Stop"

Write-Host "🔐 Generating secrets from Infisical..." -ForegroundColor Cyan
Write-Host ""

# Check if infisical CLI is installed
if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Infisical CLI is not installed." -ForegroundColor Red
    Write-Host "   Please install it first: npm install -g @infisical/cli" -ForegroundColor Yellow
    Write-Host "   Or see INFISICAL.md for other installation methods." -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    $userInfo = infisical user 2>&1 | Out-String
    if (-not ($userInfo -match "email")) {
        throw "Not logged in"
    }
} catch {
    Write-Host "❌ Error: Not logged in to Infisical." -ForegroundColor Red
    Write-Host "   Please run: pnpm infisical:login" -ForegroundColor Yellow
    exit 1
}

# Check if project is initialized
if (-not (Test-Path ".infisical.json")) {
    Write-Host "❌ Error: Infisical project not initialized." -ForegroundColor Red
    Write-Host "   Please run: pnpm infisical:init" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Exporting API secrets to apps/api/.dev.vars..." -ForegroundColor Blue
try {
    infisical export --env=development --path=/api --format=dotenv | Out-File -FilePath "apps/api/.dev.vars" -Encoding UTF8 -NoNewline
    Write-Host "✅ API secrets exported successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to export API secrets" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 Exporting Web secrets to apps/web/.env.local..." -ForegroundColor Blue
try {
    infisical export --env=development --path=/web --format=dotenv | Out-File -FilePath "apps/web/.env.local" -Encoding UTF8 -NoNewline
    Write-Host "✅ Web secrets exported successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to export Web secrets" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ All secrets generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Files created:" -ForegroundColor Cyan
Write-Host "   - apps/api/.dev.vars"
Write-Host "   - apps/web/.env.local"
Write-Host ""
Write-Host "⚠️  Remember: Never commit these files to git!" -ForegroundColor Yellow
