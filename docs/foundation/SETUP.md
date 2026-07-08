# Local Setup

Quick start for CMT Fleet Transit development on macOS / Linux / Windows (WSL or PowerShell for scripts).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | `>=18` (`.nvmrc` → **20**) | [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) recommended |
| pnpm | **8.15.x** | Matches `packageManager` in root `package.json` |
| Git | 2.x | |
| Supabase CLI | Latest (optional) | Local DB: `supabase start` / `db reset` |
| Docker | Required for local Supabase | |

### pnpm on Node 20

Homebrew’s latest `pnpm` may require Node 22+. Prefer one of:

```bash
# Via Corepack (uses packageManager field)
corepack enable
corepack prepare pnpm@8.15.0 --activate

# Or one-shot without changing global PATH
npx pnpm@8.15.0 install
```

If `which pnpm` still points at Homebrew 11.x and fails with `node:sqlite`, use `npx pnpm@8.15.0 …` for all commands below, or upgrade Node to 22+.

---

## Clone & install

```bash
cd cmt-fleetTransit   # repo root (contains pnpm-workspace.yaml)

# Use Node 20 if you manage versions with nvm/fnm
nvm use               # or: fnm use

npx pnpm@8.15.0 install
```

Workspace packages:

| Package | Role |
|---------|------|
| `apps/web` | Next.js 14 app — `localhost:3000` |
| `@cmt/shared` | Types, Zod, constants, errors |
| `@cmt/storage` | Supabase clients + adapters |

---

## Environment

```bash
cp .env.example apps/web/.env.local
```

Fill at least (local UI smoke test can run with empty provider keys):

| Variable | Required for |
|----------|----------------|
| `NEXT_PUBLIC_APP_URL` | Defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Any data API / storage call |
| `SUPABASE_SERVICE_ROLE_KEY` | Server bootstrap, migrations helpers |
| `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_ADMIN_*` | Auth (next build stage) |
| Maps / LINE keys | Routing & LINE login when those features land |

Variable reference: [env-and-secrets.md](env-and-secrets.md) and [integration-map.md](../architecture/integration-map.md).

---

## Run the web app

```bash
npx pnpm@8.15.0 dev
# → http://localhost:3000
```

Useful smoke checks:

| URL | Expect |
|-----|--------|
| `/` | Landing page |
| `/api/health` | JSON `{ ok: true, packages: { shared, storage }, roles: [...] }` |
| `/auth/login` | Placeholder until auth stage |
| `/dashboard` | Placeholder until auth + domain APIs |

---

## Local database (optional)

Requires Docker + [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start
supabase db reset    # applies migrations + supabase/seed.sql
```

Seed includes two orgs (Lincoln Transport + Metro Shuttle) for RLS isolation tests. Spec: [seed-data.md](../database/seed-data.md). Schema: [DATABASE.md](../database/DATABASE.md).

Never run `db reset` against production.

---

## Quality commands

```bash
npx pnpm@8.15.0 type-check   # all packages
npx pnpm@8.15.0 lint         # recursive lint
npx pnpm@8.15.0 format       # Prettier write
npx pnpm@8.15.0 check-secrets  # pre-push hygiene
npx pnpm@8.15.0 build        # production build of web
```

Tooling conventions: [tooling.md](tooling.md).

---

## Workspace scripts (root `package.json`)

| Script | Purpose |
|--------|---------|
| `dev` | `apps/web` next dev |
| `build` | `apps/web` next build |
| `lint` | `pnpm -r lint` |
| `type-check` | `pnpm -r type-check` |
| `format` | Prettier |
| `check-secrets` | `scripts/check-secrets.sh` |

Windows: `.\scripts\check-secrets.ps1`

---

## Project layout (dev focus)

```
apps/web/                 Next.js App Router + Tailwind
packages/shared/          @cmt/shared
packages/storage/         @cmt/storage
supabase/migrations/      SQL schema + RLS + indexes
supabase/seed.sql         Local fixtures
docs/                     Discovery → architecture → database → foundation
```

Package boundaries: [monorepo-structure.md](../architecture/monorepo-structure.md).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` | Homebrew pnpm too new for Node 20 — use `npx pnpm@8.15.0` or Node 22+ |
| `Missing required env: NEXT_PUBLIC_SUPABASE_*` | Only when constructing Supabase clients; copy `.env.example` for API work |
| Port 3000 in use | `pnpm --filter web exec next dev -p 3001` |
| Type errors after pull | `npx pnpm@8.15.0 install` then `type-check` |

---

## What’s next

Foundation exit criteria are met. Implementation continues with **authentication, RBAC, and session management** (`packages/auth`, middleware, login routes) — see project plan and [architecture approval](../architecture/approval.md).

---

## Related

- [Foundation index](README.md)
- [Env & secrets](env-and-secrets.md)
- [Database](../database/DATABASE.md)
- [Tech stack](../architecture/tech-stack.md)
