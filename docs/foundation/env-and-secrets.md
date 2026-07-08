# Environment & Secrets Hygiene

How CMT Fleet Transit documents configuration and keeps credentials out of git.

---

## `.env.example`

Template at [repo root](../../.env.example). Copy into a local ignore file:

```bash
cp .env.example apps/web/.env.local
# or: cp .env.example .env.local
```

| Group | Variables | Notes |
|-------|-----------|-------|
| App | `NEXT_PUBLIC_APP_URL`, `NODE_ENV` | Public base URL |
| Firebase client | `NEXT_PUBLIC_FIREBASE_*` | Phone / LINE client SDK |
| Firebase admin | `FIREBASE_ADMIN_*` | Server only — never `NEXT_PUBLIC_` |
| Supabase | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` | Service role bypasses RLS |
| Google Maps | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_API_KEY` | Referrer vs IP restrictions |
| LINE Login | `LINE_CHANNEL_*`, `NEXT_PUBLIC_LINE_LIFF_ID` | OAuth / LIFF |
| Optional | Sentry, Vercel analytics | Monitoring |

Org-specific LINE Messaging and Telegram bot tokens live in `organizations` table columns, not in env for multi-tenant ops.

Full map: [integration-map.md](../architecture/integration-map.md).

---

## `pnpm check-secrets`

| Script | Platform |
|--------|----------|
| [`scripts/check-secrets.sh`](../../scripts/check-secrets.sh) | macOS / Linux |
| [`scripts/check-secrets.ps1`](../../scripts/check-secrets.ps1) | Windows |

```bash
pnpm check-secrets
```

Checks:

1. No tracked `.env` files (except `.env.example`)
2. No Firebase service-account JSON
3. No `.pem` / `.p12` credential files
4. Staged diff has no obvious API key / PEM patterns
5. `.env.example` itself has no live secrets
6. SQL outside `supabase/migrations/` and `supabase/seed.sql` is flagged
7. `.gitignore` includes env + Firebase key patterns

Run before every push. CI can invoke the same script.

---

## Rules

| Do | Don't |
|----|-------|
| Use `.env.local` / hosting secret store | Commit `.env`, `.env.production` |
| Restrict Maps keys by referrer / IP | Put service role key in client bundles |
| Rotate keys if leaked to a PR or chat | Paste PEM / JSON credentials into docs |

---

## Related

- [Foundation index](README.md)
- [Integration map](../architecture/integration-map.md)
