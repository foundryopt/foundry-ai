#!/bin/bash
set -e

echo "=========================================="
echo "Foundry Warranty API - Railway Deployment"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
fi

# Login to Railway
echo ""
echo "Step 1: Login to Railway"
railway login

# Initialize project
echo ""
echo "Step 2: Initialize Railway project"
railway init

# Link to existing project or create new
echo ""
echo "Step 3: Link/Create project"
railway link

# Add PostgreSQL database
echo ""
echo "Step 4: Add PostgreSQL database"
echo "Creating PostgreSQL service..."
railway add --database postgres

# Set environment variables
echo ""
echo "Step 5: Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://www.shb.studio

# Generate and set JWT secret
JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_SECRET="$JWT_SECRET"
echo "JWT_SECRET set (save this): $JWT_SECRET"

# Deploy
echo ""
echo "Step 6: Deploying..."
railway up

# Get deployment URL
echo ""
echo "Step 7: Getting deployment URL..."
railway domain

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Note your API URL from above"
echo "2. Configure GHL webhooks to point to:"
echo "   - POST {API_URL}/api/warranty/webhook/ghl-intake"
echo "   - POST {API_URL}/api/warranty/webhook/homeowner-signoff"
echo "3. Test health endpoint: curl {API_URL}/health"
echo ""
