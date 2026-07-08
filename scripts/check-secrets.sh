#!/usr/bin/env bash
# CMT Fleet Transit — scan for accidentally committed secrets (run before push)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

echo "Security check — scanning for sensitive data..."
echo ""

echo "Checking for tracked .env files..."
if git ls-files | grep -E '(^|/)\.env($|\.local$|\.production$|\.development$)' | grep -v '\.env\.example'; then
  echo -e "${RED}CRITICAL: .env files tracked in git${NC}"
  git ls-files | grep -E '(^|/)\.env' | grep -v '\.env\.example' || true
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}OK — no .env secrets tracked${NC}"
fi
echo ""

echo "Checking for Firebase service account keys..."
if git ls-files | grep -Ei 'serviceAccountKey|firebase-adminsdk'; then
  echo -e "${RED}CRITICAL: Firebase credentials tracked in git${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}OK — no Firebase credential files${NC}"
fi
echo ""

echo "Checking for private key files..."
if git ls-files | grep -E '\.(pem|p12)$|/(secret|private)\.key$'; then
  echo -e "${RED}CRITICAL: private key files tracked in git${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}OK — no private key files${NC}"
fi
echo ""

echo "Scanning staged changes for hardcoded API keys..."
STAGED="$(git diff --cached 2>/dev/null || true)"
if echo "$STAGED" | grep -E 'AIzaSy|[sS][kK]-|[pP][kK]_|AKIA[0-9A-Z]{16}'; then
  echo -e "${RED}WARNING: potential API keys in staged changes${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}OK — no obvious API key patterns in staged diff${NC}"
fi
echo ""

echo "Scanning staged changes for PEM private keys..."
if echo "$STAGED" | grep -E 'BEGIN (RSA )?PRIVATE KEY'; then
  echo -e "${RED}CRITICAL: private key material in staged changes${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}OK — no PEM private keys in staged diff${NC}"
fi
echo ""

echo "Checking .env.example placeholder safety..."
if [[ -f .env.example ]]; then
  if grep -E 'AIzaSy|eyJhbGc|BEGIN (RSA )?PRIVATE KEY' .env.example; then
    echo -e "${RED}WARNING: .env.example appears to contain real values${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}OK — .env.example looks like placeholders${NC}"
  fi
else
  echo -e "${YELLOW}WARN — .env.example not found${NC}"
fi
echo ""

echo "Checking SQL files (migrations/seed allowed)..."
SQL_TRACKED="$(git ls-files '*.sql' '*.dump' '*.backup' 2>/dev/null || true)"
if [[ -n "$SQL_TRACKED" ]]; then
  BAD_SQL="$(echo "$SQL_TRACKED" | grep -vE '^supabase/migrations/|^supabase/seed\.sql$' || true)"
  if [[ -n "$BAD_SQL" ]]; then
    echo -e "${YELLOW}WARN — unexpected SQL/dump files (review carefully):${NC}"
    echo "$BAD_SQL"
  else
    echo -e "${GREEN}OK — only supabase/migrations and seed.sql${NC}"
  fi
else
  echo -e "${GREEN}OK — no SQL files tracked${NC}"
fi
echo ""

echo "Checking .gitignore..."
if [[ -f .gitignore ]]; then
  if grep -q '\.env' .gitignore && grep -q 'serviceAccountKey' .gitignore; then
    echo -e "${GREEN}OK — .gitignore covers env and Firebase keys${NC}"
  else
    echo -e "${YELLOW}WARN — .gitignore may be incomplete${NC}"
  fi
else
  echo -e "${RED}CRITICAL: .gitignore missing${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

echo "----------------------------------------"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "${GREEN}SECURITY CHECK PASSED${NC}"
  exit 0
fi

echo -e "${RED}SECURITY CHECK FAILED ($ERRORS issue(s))${NC}"
echo "Do not push until resolved:"
echo "  1. git rm --cached <file>"
echo "  2. ensure secrets are listed in .gitignore"
echo "  3. replace hard-coded secrets with env vars"
echo "  4. re-run: pnpm check-secrets"
exit 1
