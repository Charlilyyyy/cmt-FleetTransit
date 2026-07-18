# Setup Instructions

Full onboarding for a new developer. Target: clone → run in **under 30 minutes**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 (`.nvmrc`) |
| pnpm | 8.15.x (via `corepack`) |
| Supabase CLI | latest |
| Docker | for local Supabase |

```bash
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

---

## 1. Clone & install

```bash
git clone <repo-url> cmt-fleet-transit
cd cmt-fleet-transit
pnpm install
```

## 2. Environment

```bash
cp .env.example apps/web/.env.local
# fill Firebase, Supabase, Google Maps keys
```

## 3. Local database

```bash
supabase start
supabase db reset   # applies migrations + seed.sql (two-tenant fixtures)
```

## 4. Run

```bash
pnpm dev            # http://localhost:3000
```

Smoke check: open `/api/health`, then sign in at `/auth/login`.

---

## Quality commands

| Command | Purpose |
|---------|---------|
| `pnpm type-check` | Types across all packages |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (routing, notifications, shared) |
| `pnpm check-secrets` | Pre-push secret scan |
| `pnpm build` | Production build of `apps/web` |

---

## Project layout

```
apps/web              Next.js app (dashboard, driver, parent, APIs)
packages/shared       types, Zod schemas, constants, utils
packages/storage      Supabase client + adapter
packages/auth         Firebase, RBAC, LINE
packages/routing      distance matrix, Clarke-Wright, 2-opt
packages/notifications Telegram, LINE, FCM + templates
supabase/             migrations + local seed
docs/                 per-area documentation
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `node:sqlite` error on install | Use `corepack pnpm` under Node 20, not a shadowed global pnpm |
| Maps not rendering | Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY`; picker falls back to manual coords |
| 401 on dashboard | Sign in; middleware requires the session cookie |
| Realtime offline badge | Set `NEXT_PUBLIC_SUPABASE_*`; tracking degrades gracefully without it |

---

## Related

- [Free-tier deployment](DEPLOYMENT_FREE_TIER.md)
- [Foundation SETUP](../foundation/SETUP.md)
