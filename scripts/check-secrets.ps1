# CMT Fleet Transit — scan for accidentally committed secrets (PowerShell)
# Run from repo root before push: .\scripts\check-secrets.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$errors = 0

Write-Host "Security check — scanning for sensitive data..."
Write-Host ""

Write-Host "Checking for tracked .env files..."
$envFiles = git ls-files | Select-String -Pattern '(^|/)\.env($|\.local$|\.production$|\.development$)' |
  Where-Object { $_.Line -notmatch '\.env\.example' }
if ($envFiles) {
  Write-Host "CRITICAL: .env files tracked in git" -ForegroundColor Red
  $envFiles
  $errors++
} else {
  Write-Host "OK — no .env secrets tracked" -ForegroundColor Green
}
Write-Host ""

Write-Host "Checking for Firebase service account keys..."
$firebaseKeys = git ls-files | Select-String -Pattern 'serviceAccountKey|firebase-adminsdk'
if ($firebaseKeys) {
  Write-Host "CRITICAL: Firebase credentials tracked in git" -ForegroundColor Red
  $firebaseKeys
  $errors++
} else {
  Write-Host "OK — no Firebase credential files" -ForegroundColor Green
}
Write-Host ""

Write-Host "Checking for private key files..."
$privateKeys = git ls-files | Select-String -Pattern '\.(pem|p12)$|/(secret|private)\.key$'
if ($privateKeys) {
  Write-Host "CRITICAL: private key files tracked in git" -ForegroundColor Red
  $privateKeys
  $errors++
} else {
  Write-Host "OK — no private key files" -ForegroundColor Green
}
Write-Host ""

Write-Host "Scanning staged changes for hardcoded API keys..."
$staged = git diff --cached 2>$null
if ($staged -match 'AIzaSy|[sS][kK]-|[pP][kK]_|AKIA[0-9A-Z]{16}') {
  Write-Host "WARNING: potential API keys in staged changes" -ForegroundColor Red
  $errors++
} else {
  Write-Host "OK — no obvious API key patterns in staged diff" -ForegroundColor Green
}
Write-Host ""

Write-Host "Scanning staged changes for PEM private keys..."
if ($staged -match 'BEGIN (RSA )?PRIVATE KEY') {
  Write-Host "CRITICAL: private key material in staged changes" -ForegroundColor Red
  $errors++
} else {
  Write-Host "OK — no PEM private keys in staged diff" -ForegroundColor Green
}
Write-Host ""

Write-Host "Checking .env.example placeholder safety..."
if (Test-Path ".env.example") {
  $envExample = Get-Content ".env.example" -Raw
  if ($envExample -match 'AIzaSy|eyJhbGc|BEGIN (RSA )?PRIVATE KEY') {
    Write-Host "WARNING: .env.example appears to contain real values" -ForegroundColor Red
    $errors++
  } else {
    Write-Host "OK — .env.example looks like placeholders" -ForegroundColor Green
  }
} else {
  Write-Host "WARN — .env.example not found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Checking SQL files (migrations/seed allowed)..."
$sqlTracked = git ls-files "*.sql" "*.dump" "*.backup" 2>$null
if ($sqlTracked) {
  $badSql = $sqlTracked | Where-Object { $_ -notmatch '^supabase/migrations/' -and $_ -ne 'supabase/seed.sql' }
  if ($badSql) {
    Write-Host "WARN — unexpected SQL/dump files (review carefully):" -ForegroundColor Yellow
    $badSql
  } else {
    Write-Host "OK — only supabase/migrations and seed.sql" -ForegroundColor Green
  }
} else {
  Write-Host "OK — no SQL files tracked" -ForegroundColor Green
}
Write-Host ""

Write-Host "Checking .gitignore..."
if (Test-Path ".gitignore") {
  $gitignore = Get-Content ".gitignore" -Raw
  if ($gitignore -match '\.env' -and $gitignore -match 'serviceAccountKey') {
    Write-Host "OK — .gitignore covers env and Firebase keys" -ForegroundColor Green
  } else {
    Write-Host "WARN — .gitignore may be incomplete" -ForegroundColor Yellow
  }
} else {
  Write-Host "CRITICAL: .gitignore missing" -ForegroundColor Red
  $errors++
}
Write-Host ""

Write-Host "----------------------------------------"
if ($errors -eq 0) {
  Write-Host "SECURITY CHECK PASSED" -ForegroundColor Green
  exit 0
}

Write-Host "SECURITY CHECK FAILED ($errors issue(s))" -ForegroundColor Red
Write-Host "Do not push until resolved:"
Write-Host "  1. git rm --cached <file>"
Write-Host "  2. ensure secrets are listed in .gitignore"
Write-Host "  3. replace hard-coded secrets with env vars"
Write-Host "  4. re-run: pnpm check-secrets"
exit 1
