# Database Design

Data layer design for CMT Fleet Transit: multi-tenant PostgreSQL on Supabase with Row-Level Security, migrations, and seed data for local development.

## Purpose

Architecture is approved ([ADR-001](../architecture/adr/001-supabase-postgres-rls.md)). This folder defines **what** is stored and **how** tenants are isolated before application code writes queries.

1. **ERD** — entities and relationships
2. **Schema** — tables, columns, constraints
3. **RLS policies** — per table and per role
4. **Indexes** — hot query paths
5. **Migrations** — incremental SQL in `supabase/migrations/`
6. **Seed data** — local development fixtures
7. **DATABASE.md** — consolidated schema reference

## Documents

| File | Focus |
|------|-------|
| [erd.md](erd.md) | Entity-relationship diagram |
| [schema.md](schema.md) | Table definitions and constraints |
| [rls-policies.md](rls-policies.md) | Row-Level Security per role |
| [indexes.md](indexes.md) | Performance indexes |
| [migrations.md](migrations.md) | Migration strategy and file order |
| [seed-data.md](seed-data.md) | Development seed specification |
| [DATABASE.md](DATABASE.md) | Complete schema documentation (summary) |

## Entities (v1)

| Entity | Tenant-scoped | Description |
|--------|---------------|-------------|
| `organizations` | — (root tenant) | Bus vendor / operator account |
| `users` | ✓ | Login profiles linked to Firebase |
| `schools` | ✓ | Schools served by org |
| `vehicles` | ✓ | Fleet units with seat capacity |
| `drivers` | ✓ | Driver records linked to users |
| `passengers` | ✓ | Students / riders |
| `passenger_guardians` | ✓ | Guardian ↔ passenger links |
| `routes` | ✓ | Named route templates |
| `route_stops` | ✓ | Ordered stops on a route |
| `trips` | ✓ | Scheduled execution of a route |
| `check_ins` | ✓ | Boarding / alighting events |
| `locations` | ✓ | GPS points during active trips |
| `notifications` | ✓ | Delivery log per message |
| `audit_logs` | ✓ | Mutation and privileged action log |

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Tenant isolation** | `organization_id` on all tenant tables + RLS |
| **UUID primary keys** | `gen_random_uuid()` / `crypto.randomUUID()` at app layer |
| **Soft status** | `status` enum columns; avoid hard delete with history |
| **Timestamps** | `created_at`, `updated_at` on mutable tables |
| **Referential integrity** | Foreign keys within org scope |
| **Least privilege** | RLS matches [personas](../discovery/personas.md) matrix |

## Inputs

| Source | Link |
|--------|------|
| Architecture | [ADR-001 Supabase + RLS](../architecture/adr/001-supabase-postgres-rls.md) |
| MVP features | [mvp-features.md](../requirements/mvp-features.md) |
| Integration map | [integration-map.md](../architecture/integration-map.md) |

## Outputs

| Output | Location |
|--------|----------|
| SQL migrations | `supabase/migrations/*.sql` |
| Seed SQL | `supabase/seed.sql` (or migration) |
| Schema reference | [DATABASE.md](DATABASE.md) |
| RLS tests | Documented in migrations stage |

## Exit Criteria

- [ ] `supabase db push` applies cleanly
- [ ] RLS: tenant A cannot read tenant B data
- [ ] Schema documented in [DATABASE.md](DATABASE.md)

## Related

- [Monorepo structure](../architecture/monorepo-structure.md) — `supabase/` path
- [Regulatory compliance](../research/regulatory-compliance.md) — child data, photos
