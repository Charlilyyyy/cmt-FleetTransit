# Free-Tier Deployment

Run CMT Fleet Transit for **$0/month** on managed free tiers. Suitable for a pilot organization.

---

## Stack

| Layer | Service | Free tier |
|-------|---------|-----------|
| Web hosting | Vercel Hobby | Personal projects, preview deploys |
| Database + Realtime + Storage | Supabase Free | 500 MB DB, 1 GB storage |
| Auth | Firebase Spark | Phone auth (SMS quota), Admin SDK |
| Maps | Google Maps Platform | $200/mo credit |
| Notifications | Telegram / LINE / FCM | Free APIs |

---

## 1. Supabase (database)

```bash
supabase link --project-ref <your-ref>
supabase db push          # apply migrations
# seed is for local only — do NOT run seed.sql on production
```

Create the private `check-in-photos` storage bucket. Confirm RLS is enabled on all tenant tables.

## 2. Firebase (auth)

1. Create a project; enable **Phone** sign-in.
2. Generate an Admin SDK service account.
3. Add the web app's config to the client env vars.

## 3. Google Maps

Enable **Maps JavaScript API**, **Distance Matrix API**, **Directions API**. Restrict the browser key by HTTP referrer and the server key by IP.

## 4. Vercel (web)

1. Import the repo; framework auto-detects Next.js.
2. Set env vars for **Production** and **Preview** (see [`.env.example`](../../.env.example)).
3. Deploy:

```bash
scripts/deploy.sh production
```

`vercel.json` pins the build to `pnpm --filter web build` and region `sin1`.

---

## Environment Separation

| Environment | DB | Auth | Notes |
|-------------|----|------|-------|
| dev | local Supabase (`supabase start`) | Firebase dev | seeded via `supabase db reset` |
| staging | Supabase staging project | Firebase dev | `scripts/deploy.sh staging` |
| production | Supabase prod project | Firebase prod | `scripts/deploy.sh production` |

Never share service role keys across environments.

---

## Cost Guardrails

- Watch Supabase DB size (500 MB) — prune old `location_samples`.
- Monitor Firebase SMS quota; phone auth is the main metered cost.
- Google Maps stays free under the $200 credit for pilot volumes.

---

## Related

- [Setup instructions](SETUP_INSTRUCTIONS.md)
- [Runbook](RUNBOOK.md)
- [Security checklist](../security/SECURITY_CHECKLIST.md)
