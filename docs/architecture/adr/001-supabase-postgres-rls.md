# ADR-001: Use Supabase PostgreSQL with RLS for Multi-Tenancy

**Status:** Accepted  
**Date:** 2026-06-29

## Context

CMT Fleet Transit is multi-tenant B2B SaaS: one bus vendor may serve multiple schools; strict isolation between organizations is a release blocker ([NFR-S02](../../requirements/non-functional-requirements.md)). We need relational data (routes, stops, trips, check-ins), realtime GPS fanout, file storage for photos, and a free-tier path for pilot deployment.

Alternatives: Firebase Firestore, PlanetScale MySQL, self-hosted Postgres, Neon + separate realtime service.

## Decision

Use **Supabase** as the data plane:

- **PostgreSQL** for all fleet entities and audit logs
- **Row-Level Security (RLS)** on every tenant table keyed by `organization_id`
- **Realtime** for `locations` and `trips` subscriptions
- **Storage** for check-in photos in a private bucket
- **Migrations** via `supabase/migrations/*.sql` and `supabase db push`

Application access via `packages/storage` with browser client (user JWT) and server client (session cookie). Service role key restricted to migrations and ops scripts — never exposed to client.

## Consequences

### Positive

- SQL fits reports, joins, and attendance queries naturally
- RLS enforces tenant boundary even if application code has a bug
- Realtime included without separate WebSocket infrastructure
- Free tier supports pilot org at $0
- Single vendor for DB + realtime + files reduces integration surface

### Negative

- RLS policies are complex to test and can impact query performance if poorly indexed
- Vendor lock-in to Supabase hosting model (mitigated: standard Postgres export)
- Connection limits on free tier constrain concurrent Realtime subscribers

### Neutral

- Auth identity remains in Firebase (ADR-002); Supabase stores profile and fleet data only
- Schema design and ERD documented in subsequent database design work
