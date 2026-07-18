# Operations Runbook

Incident response, backup/restore, and rollback procedures for CMT Fleet Transit maintainers.

---

## Monitoring

| Signal | Where | Watch for |
|--------|-------|-----------|
| App errors | Vercel logs / Functions | 5xx spikes, unhandled rejections |
| DB size | Supabase dashboard | Approaching 500 MB (free tier) |
| API quota | Google Cloud console | Distance Matrix / Maps usage vs $200 credit |
| Auth quota | Firebase console | Phone/SMS verification limits |
| Realtime | Supabase Realtime inspector | Dropped subscriptions |

Set alerts (email/Slack) for 5xx rate and DB size > 80%.

---

## Incident Response

1. **Detect** — alert or user report.
2. **Assess** — check Vercel function logs and Supabase logs; identify the failing route/table.
3. **Contain** — if a bad deploy, roll back in Vercel (Deployments → Promote previous).
4. **Communicate** — notify affected org admins.
5. **Fix** — patch, run quality gates, redeploy.
6. **Review** — write a short postmortem; add a regression test.

### Common incidents

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| All API calls 401 | Firebase Admin key rotated/expired | Update `FIREBASE_ADMIN_*`, redeploy |
| Cross-tenant data visible | RLS disabled on a table | Re-enable RLS; audit policies |
| Check-ins failing offline sync | Client queue stuck | Confirm `/api/trips/*/checkin` reachable; queue retries on reconnect |
| Maps blank | Maps key referrer restriction | Fix allowed referrers; picker falls back to manual coords |

---

## Backup & Restore

### Backup (daily recommended)

```bash
supabase db dump --project-ref <prod-ref> -f backup-$(date +%F).sql
```

Store dumps off-platform (e.g. encrypted object storage). Storage bucket (`check-in-photos`) is backed up via Supabase's retention or a periodic sync.

### Restore

```bash
# On a fresh/staging project first — never test restore on prod directly.
psql "$DATABASE_URL" < backup-YYYY-MM-DD.sql
```

Verify RLS is enabled after restore, then re-point the app env to the restored DB.

---

## Migration Rollback

Migrations are forward-only SQL files in `supabase/migrations/`.

1. Write a **new** migration that reverses the change (preferred over editing history).
2. Apply with `supabase db push`.
3. If a migration corrupted data, restore from the latest backup and replay clean migrations.

Never edit or delete an already-applied migration file.

---

## Post-Launch Checklist

- [ ] At least one pilot organization onboarded
- [ ] Alerts configured for 5xx and DB size
- [ ] Daily DB backup scheduled
- [ ] On-call contact documented
- [ ] Runbook reviewed by a second maintainer

---

## Related

- [Free-tier deployment](DEPLOYMENT_FREE_TIER.md)
- [Security audit](../security/DEEP_SECURITY_AUDIT.md)
- [Database reference](../database/DATABASE.md)
