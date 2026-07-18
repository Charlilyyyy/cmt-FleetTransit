# Pre-Commit Verification

Run these checks before every commit/push. CI enforces the same gates.

## Required gates

```bash
pnpm type-check    # tsc across all packages
pnpm lint          # ESLint
pnpm test          # unit tests
pnpm check-secrets # scan staged changes for secrets
```

All four must pass.

## What each gate catches

| Gate | Catches |
|------|---------|
| type-check | Type errors, broken contracts across packages |
| lint | Style violations, unused vars, unsafe patterns |
| test | Regressions in routing, notifications, shared utils |
| check-secrets | `.env` files, API keys, service accounts in staged diffs |

## Secret hygiene

- Never commit `.env*` (except `.env.example` with placeholders).
- Keep the service role key and Firebase Admin key server-side only.
- If a secret is committed, rotate it immediately and scrub history.

## Suggested Git hook

`.git/hooks/pre-push`:

```bash
#!/usr/bin/env bash
set -e
pnpm type-check && pnpm lint && pnpm test && bash scripts/check-secrets.sh
```

## Related

- [Contributing](CONTRIBUTING.md)
- [Security checklist](docs/security/SECURITY_CHECKLIST.md)
