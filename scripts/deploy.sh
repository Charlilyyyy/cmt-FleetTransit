#!/usr/bin/env bash
# CMT Fleet Transit — guarded deploy to Vercel (web) with quality gates.
# Usage: scripts/deploy.sh [staging|production]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENVIRONMENT="${1:-staging}"

echo "==> Deploying CMT Fleet Transit to: ${ENVIRONMENT}"

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "Unknown environment: ${ENVIRONMENT} (expected staging|production)" >&2
  exit 1
fi

echo "==> 1/5 Secret scan"
bash scripts/check-secrets.sh

echo "==> 2/5 Type-check"
pnpm type-check

echo "==> 3/5 Lint"
pnpm lint

echo "==> 4/5 Tests"
pnpm test

echo "==> 5/5 Vercel deploy"
if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  vercel deploy --prod
else
  vercel deploy
fi

echo "==> Done. Remember to apply DB migrations: supabase db push"
