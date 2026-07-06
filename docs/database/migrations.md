# Migration Strategy

Incremental SQL migrations for CMT Fleet Transit Supabase PostgreSQL. Applies with `supabase db push` (remote) or `supabase db reset` (local).

---

## Principles

| Principle | Practice |
|-----------|----------|
| **Incremental files** | One concern per file; timestamp prefix ordering |
| **Forward only** | No editing applied migrations; add new file to change |
| **Idempotent indexes** | `CREATE INDEX IF NOT EXISTS` where safe |
| **RLS after schema** | Tables exist before policies |
| **Indexes after RLS** | Policies don't depend on indexes |
| **Reversible docs** | Note manual rollback in PR description |

---

## File Order

| File | Purpose |
|------|---------|
| `20240101000000_initial_schema.sql` | Extensions, enums, tables, triggers |
| `20240101000001_rls_policies.sql` | Enable RLS, helper functions, policies |
| `20240101000002_add_indexes.sql` | Performance indexes |

Future migrations (examples):

| File | Purpose |
|------|---------|
| `20240101000003_line_login.sql` | LINE-specific columns if needed |
| `20240101000004_location_columns.sql` | GPS column tweaks |
| `20240101000005_seed_dev.sql` | Optional dev-only seed (local) |

---

## Naming Convention

```
YYYYMMDDHHMMSS_short_description.sql
```

Use UTC timestamp. Description: snake_case, verb-noun (`add_indexes`, `rls_policies`).

---

## Local Workflow

```bash
# Install Supabase CLI
supabase login

# Start local stack
supabase start

# Apply all migrations (fresh)
supabase db reset

# Or push to linked remote project
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## Remote / CI Workflow

| Environment | Command | When |
|-------------|---------|------|
| Staging | `supabase db push` | Merge to `develop` |
| Production | `supabase db push` | Tagged release, manual approval |

**Never** run `db reset` against production.

---

## Migration Checklist (Per File)

- [ ] Matches [schema](schema.md) column names and types
- [ ] `organization_id` on all tenant tables
- [ ] FK references valid parent tables
- [ ] RLS enabled in `*_rls_policies.sql` not schema file
- [ ] Indexes in separate file after RLS
- [ ] `updated_at` triggers on mutable tables
- [ ] Tested locally with `supabase db reset`

---

## Rollback Strategy

Supabase migrations are forward-only. To rollback:

1. Write a **new** migration that reverses changes (`DROP POLICY`, `DROP INDEX`, `ALTER TABLE DROP COLUMN`)
2. Or restore database backup (production runbook)

Document rollback SQL in PR when migration is destructive.

---

## Auth Integration Note

RLS policies read JWT claims (`role`, `organization_id`) set by the application after Firebase verification. API routes use Supabase server client with a user-scoped JWT or set session claims before queries.

Service role (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS — **server-only** for admin bootstrap and migrations.

JWT helper functions are created in the `public` schema with `app_` prefix (e.g. `app_organization_id()`, `app_user_role()`). See `20240101000001_rls_policies.sql`.

---

## Realtime Publication

After schema apply, enable Realtime for high-churn tables (in migration or Supabase dashboard):

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
```

---

## Storage Buckets

Create `check-in-photos` bucket via Supabase dashboard or migration using `storage.buckets` insert. RLS policies on `storage.objects` documented in [rls-policies](rls-policies.md).

---

## Verification

```bash
# After db reset
supabase db lint          # if available
psql -c "\dt"             # list tables
# Run RLS test suite (app CI) — tests T1–T8 from rls-policies.md
```

Exit criterion: `supabase db push` applies cleanly on empty project.

---

## Related Documents

- [Schema](schema.md)
- [RLS policies](rls-policies.md)
- [Indexes](indexes.md)
- [Seed data](seed-data.md)
