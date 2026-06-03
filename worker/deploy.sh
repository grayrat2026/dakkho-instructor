#!/bin/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DAKKHO Admin — Cloudflare Worker Deployment Script
# ═══════════════════════════════════════════════════════════════
#
# USAGE:
#   export CLOUDFLARE_API_TOKEN="your-token-here"
#   bash deploy-worker.sh
#
# REQUIRED TOKEN PERMISSIONS:
#   - Workers Scripts: Edit
#   - D1: Edit
#   - Workers KV Storage: Edit
#   - Account Settings: Read
#
# Create token at: https://dash.cloudflare.com/profile/api-tokens
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

echo "════════════════════════════════════════════════════════════"
echo "  DAKKHO Admin API — Cloudflare Worker Deployment"
echo "════════════════════════════════════════════════════════════"

# Check for API token
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "❌ ERROR: CLOUDFLARE_API_TOKEN not set!"
  echo ""
  echo "Run: export CLOUDFLARE_API_TOKEN='your-token-here'"
  echo "Create token: https://dash.cloudflare.com/profile/api-tokens"
  exit 1
fi

# Verify token
echo ""
echo "1️⃣  Verifying Cloudflare API token..."
WHOAMI=$(npx wrangler whoami 2>&1) || {
  echo "❌ Token verification failed!"
  echo "$WHOAMI"
  exit 1
}
echo "✅ Token valid!"
echo "$WHOAMI" | grep "Account" || true

# Step 1: Initialize D1 database schema
echo ""
echo "2️⃣  Initializing D1 database schema..."
npx wrangler d1 execute dakkho-admin-db --remote --file=./schema.sql || {
  echo "⚠️  D1 schema init failed (may already exist). Continuing..."
}

# Step 2: Set secrets
echo ""
echo "3️⃣  Setting worker secrets..."

echo "standard_c465097b57e28bd7eed617fae6e488b82587b8474d66def111cf4693351e3c89b558bf391bee4aa87dccb718d9d03a69a7257dbd59696c8f164aa5b4b44fc987b374bd8532429dccd318bbc1e15e683eaf429e57e04f2f5fbd8f1fc522e67494dcf855901261f4a4cd709c90a20fd407df4fc5826b807cf9d4b42e4478684c28" | npx wrangler secret put APPWRITE_API_KEY || echo "⚠️  APPWRITE_API_KEY secret may already be set"

echo "re_YBYgjXfu_JAQbAR51HADxWUUpPEBKgdG2" | npx wrangler secret put RESEND_API_KEY || echo "⚠️  RESEND_API_KEY secret may already be set"

echo "dakkho-admin-secret-2024" | npx wrangler secret put ADMIN_SECRET_KEY || echo "⚠️  ADMIN_SECRET_KEY secret may already be set"

# Step 3: Deploy worker
echo ""
echo "4️⃣  Deploying Cloudflare Worker..."
npx wrangler deploy || {
  echo "❌ Worker deployment failed!"
  exit 1
}
echo "✅ Worker deployed!"

# Step 4: Verify deployment
echo ""
echo "5️⃣  Verifying deployment..."
sleep 3

echo ""
echo "  Health Check:"
curl -s https://dakkho-admin-api.dakkho-admin.workers.dev/ | python3 -m json.tool 2>/dev/null || echo "  ⚠️  Health check failed"

echo ""
echo "  System Status:"
curl -s https://dakkho-admin-api.dakkho-admin.workers.dev/admin/system/status | python3 -m json.tool 2>/dev/null || echo "  ⚠️  Status check failed"

echo ""
echo "  Login Test:"
curl -s -X POST https://dakkho-admin-api.dakkho-admin.workers.dev/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"himadrient@proton.me","password":"Sr5051380@"}' | python3 -m json.tool 2>/dev/null || echo "  ⚠️  Login test failed"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo ""
echo "  Frontend:  https://grayrat2026.github.io/dakkho-admin/"
echo "  API:       https://dakkho-admin-api.dakkho-admin.workers.dev/"
echo "════════════════════════════════════════════════════════════"
