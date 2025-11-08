#!/bin/bash

# Generate secrets from Infisical to local environment files
# This script exports secrets for development environment

set -e  # Exit on error

echo "🔐 Generating secrets from Infisical..."
echo ""

# Check if infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo "❌ Error: Infisical CLI is not installed."
    echo "   Please install it first: npm install -g @infisical/cli"
    echo "   Or see INFISICAL.md for other installation methods."
    exit 1
fi

# Check if user is logged in
if ! infisical user 2>/dev/null | grep -q "email"; then
    echo "❌ Error: Not logged in to Infisical."
    echo "   Please run: pnpm infisical:login"
    exit 1
fi

# Check if project is initialized
if [ ! -f ".infisical.json" ]; then
    echo "❌ Error: Infisical project not initialized."
    echo "   Please run: pnpm infisical:init"
    exit 1
fi

echo "📦 Exporting API secrets to apps/api/.dev.vars..."
infisical export --env=development --path=/api --format=dotenv > apps/api/.dev.vars

if [ $? -eq 0 ]; then
    echo "✅ API secrets exported successfully"
else
    echo "❌ Failed to export API secrets"
    exit 1
fi

echo ""
echo "🌐 Exporting Web secrets to apps/web/.env.local..."
infisical export --env=development --path=/web --format=dotenv > apps/web/.env.local

if [ $? -eq 0 ]; then
    echo "✅ Web secrets exported successfully"
else
    echo "❌ Failed to export Web secrets"
    exit 1
fi

echo ""
echo "✨ All secrets generated successfully!"
echo ""
echo "📝 Files created:"
echo "   - apps/api/.dev.vars"
echo "   - apps/web/.env.local"
echo ""
echo "⚠️  Remember: Never commit these files to git!"
