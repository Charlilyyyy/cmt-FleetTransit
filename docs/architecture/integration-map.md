# Integration Map

External services connected to CMT Fleet Transit: credentials, data flows, owning package, and failure behavior. Complements [system overview](system-overview.md) and [tech stack](tech-stack.md).

---

## Integration Summary

| Service | Purpose | Package / location | Auth method |
|---------|---------|-------------------|-------------|
| **Firebase Auth** | Phone OTP, identity | `packages/auth` | API keys + Admin SDK |
| **Firebase FCM** | Push notifications | `packages/notifications` | Admin SDK / HTTP v1 |
| **Supabase Postgres** | Fleet data + RLS | `packages/storage` | Anon key + user JWT; service role server-only |
| **Supabase Realtime** | GPS + trip live updates | `apps/web` client subscribe | User JWT |
| **Supabase Storage** | Check-in photos | `packages/storage` | Signed URLs |
| **Google Maps** | Matrix, directions, map UI | `packages/routing`, web components | API key (referrer-restricted) |
| **LINE Login** | OAuth for admins/guardians | `packages/auth` | Channel ID + secret |
| **LINE Messaging** | Guardian alerts | `packages/notifications` | Per-org channel token (DB) |
| **Telegram Bot** | Guardian alerts | `packages/notifications` | Per-org bot token (DB) |
| **Vercel** | Hosting, env, previews | `apps/web` deploy | Dashboard OAuth |

---

## Integration Diagram

```
                         ┌─────────────────────────────────┐
                         │         apps/web (Vercel)        │
                         └───────────────┬─────────────────┘
                                         │
       ┌─────────────┬──────────┬────────┼────────┬──────────────┐
       ▼             ▼          ▼        ▼        ▼              ▼
  ┌─────────┐  ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────┐   ┌──────────┐
  │Firebase │  │ Supabase │ │Google│ │ LINE │ │Tele- │   │   FCM    │
  │  Auth   │  │ PG+RT+ST │ │ Maps │ │Login │ │gram  │   │ (Firebase)│
  └─────────┘  └──────────┘ └──────┘ └──┬───┘ └──┬───┘   └──────────┘
       │             │          │       │        │
       │             │          │       └────┬───┘
       │             │          │            ▼
       │             │          │     LINE Messaging API
       └─────────────┴──────────┴── (server-side API routes only)
```

---

## Firebase

### Components used

| Component | Role |
|-----------|------|
| **Authentication** | Phone number OTP for Driver, Guardian, Admin |
| **Admin SDK** | Verify ID tokens; set custom claims (`role`, `organization_id`) |
| **FCM** | Mobile/web push for guardians |

### Data flow

```
Client: signInWithPhoneNumber → OTP
        │
        ▼
POST /api/auth/verify (ID token)
        │
        ├── admin.auth().verifyIdToken()
        ├── admin.auth().setCustomUserClaims({ role, organization_id })
        └── Sync user row in Supabase `users`
        │
        ▼
Session cookie issued (apps/web lib/session.ts)
```

### Environment variables

| Variable | Exposure | Required |
|----------|----------|----------|
| `NEXT_PUBLIC_FIREBASE_*` | Client | Yes |
| `FIREBASE_ADMIN_PROJECT_ID` | Server only | Yes |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server only | Yes |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server only | Yes |

### Failure behavior

| Failure | Behavior |
|---------|----------|
| Invalid OTP | 401; no session |
| Admin SDK down | 503; login blocked; show retry |
| Claims not set | Middleware rejects; force re-login |

**Package:** `packages/auth/src/firebase-client.ts`, `firebase-admin.ts`

---

## Supabase

### Components used

| Component | Role |
|-----------|------|
| **PostgreSQL** | All fleet entities, check-ins, audit logs |
| **RLS** | Tenant + role isolation |
| **Realtime** | `locations`, `trips` status changes |
| **Storage** | `check-in-photos` private bucket |

### Client types

| Client | When | Key |
|--------|------|-----|
| Browser | Dashboard, parent map subscribe | Anon + user session |
| Server (cookie) | API routes, Server Components | User JWT from session |
| Service role | Migrations, admin scripts only | `SUPABASE_SERVICE_ROLE_KEY` — **never client** |

### Realtime channels (target)

| Channel pattern | Events | Subscribers |
|-----------------|--------|-------------|
| `trip:{id}:locations` | INSERT on `locations` | Dashboard, guardian (scoped) |
| `trip:{id}:status` | UPDATE on `trips` | Dashboard |

### Storage

| Bucket | Path pattern | Access |
|--------|--------------|--------|
| `check-in-photos` | `{org_id}/{trip_id}/{passenger_id}/{uuid}.jpg` | Signed URL; Admin + linked Guardian |

### Environment variables

| Variable | Exposure |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |

### Failure behavior

| Failure | Behavior |
|---------|----------|
| RLS denial | Empty result or 403 — never leak other tenant |
| Realtime disconnect | UI reconnect + show stale timestamp |
| Storage upload fail | Driver retry; queue if offline (E10) |

**Package:** `packages/storage`  
**Migrations:** `supabase/migrations/`

---

## Google Maps Platform

### APIs used

| API | Use case | Called from |
|-----|----------|-------------|
| **Distance Matrix** | Pairwise stop distances for VRP | `packages/routing` (server) |
| **Directions** | Optional route polyline on map | Server or client |
| **Maps JavaScript API** | Dashboard map, guardian map, stop picker | `GoogleMapsLoader` (client) |

### Data flow — optimization

```
POST /api/routes/optimize
        │
        ▼
distance-calculator → Google Distance Matrix (batched)
        │
        ▼
distance-cache (LRU) — check before API call
        │
        ▼
vrp-solver → route-optimizer → JSON response
```

### Environment variables

| Variable | Exposure | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client | Restrict by HTTP referrer |
| `GOOGLE_MAPS_API_KEY` | Server | Restrict by IP / server apps |

### Quota management

- Cache hit target > 60% on repeat optimize for same route
- Alert at 80% monthly quota (GCP console)
- Fallback: return error; admin uses manual order

**Package:** `packages/routing`, `apps/web` map components

---

## LINE

### Two LINE integrations

| Product | Purpose | Config storage |
|---------|---------|----------------|
| **LINE Login** | OAuth sign-in | Env: `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_LINE_LIFF_ID` |
| **LINE Messaging API** | Push messages to guardians | Per-org in `organizations.line_channel_access_token` (encrypted) |

### LINE Login flow

```
User → LINE OAuth / LIFF
        │
        ▼
POST /api/auth/line (authorization code)
        │
        ├── Exchange token with LINE API
        ├── Map LINE user id → Supabase user
        └── Session cookie
```

### Messaging flow

```
check-in event → notification-service
        │
        ▼
line.ts → POST https://api.line.me/v2/bot/message/push
        │
        └── Uses org-stored channel access token
```

### Failure behavior

| Failure | Behavior |
|---------|----------|
| LINE Login cancelled | Return to login page |
| Messaging 401 | Log; retry once; fallback FCM if token registered |

**Package:** `packages/auth/line-auth.ts`, `packages/notifications/line.ts`

---

## Telegram

### Setup

- Org admin provides bot token (BotFather)
- Stored encrypted in DB: `organizations.telegram_bot_token`
- Guardian starts bot or opens `t.me/{bot}?start={passenger_link_code}`

### Messaging flow

```
notification-service → telegram.ts
        │
        ▼
POST https://api.telegram.org/bot{token}/sendMessage
```

### Failure behavior

| Failure | Behavior |
|---------|----------|
| Guardian blocked bot | Mark delivery failed; admin dashboard warning |
| Invalid token | Disable Telegram for org; alert Admin |

**Package:** `packages/notifications/telegram.ts`

---

## FCM (Firebase Cloud Messaging)

### Setup

- Guardian registers device token on login (`/api/auth/session` or dedicated endpoint)
- Stored: `guardian_devices.fcm_token`

### Messaging flow

```
notification-service → fcm.ts
        │
        ▼
Firebase Admin messaging().send({ token, notification, data })
```

### Payload (example)

```json
{
  "notification": { "title": "Pickup confirmed", "body": "Maria boarded Bus 12" },
  "data": { "trip_id": "...", "passenger_id": "...", "type": "pickup" }
}
```

**Package:** `packages/notifications/fcm.ts`

---

## Notification Dispatch Logic

`packages/notifications/src/notification-service.ts`:

```
dispatch(event, guardian, orgConfig):
  1. Resolve template (pickup | dropoff | delay | emergency)
  2. Render variables (passenger name, time, stop)
  3. For each enabled channel in orgConfig:
       - try FCM if token exists
       - try LINE if line_user_id exists
       - try Telegram if chat_id exists
  4. Log delivery result to notifications table
  5. On total failure → audit log + optional admin alert
```

| Event source | Triggers |
|--------------|----------|
| Check-in INSERT | pickup template |
| Check-out INSERT | dropoff template |
| Admin action | delay, emergency |
| Trip status (future) | auto delay if behind threshold |

---

## Vercel

| Feature | Use |
|---------|-----|
| Production deploy | `main` branch → prod URL |
| Preview | PR previews with staging env vars |
| Environment variables | Per-environment secrets |
| Edge middleware | `middleware.ts` auth |

**Not integrated in code** — deployment config only. See `scripts/deploy.sh` in monorepo bootstrap.

---

## Credentials Matrix

| Secret | Storage | Rotates |
|--------|---------|---------|
| Firebase admin private key | Vercel env | Yearly |
| Supabase service role | Vercel env | On compromise |
| Supabase anon key | Public (RLS protects) | Rare |
| Google Maps server key | Vercel env | On leak |
| LINE channel secret | Vercel env | LINE console |
| LINE Messaging token | Supabase org row | Per org |
| Telegram bot token | Supabase org row | Per org |

**Never** commit secrets; `scripts/check-secrets.sh` scans staged files.

---

## Network Egress Summary

| From | To | Protocol |
|------|-----|----------|
| Browser | Vercel (Next.js) | HTTPS |
| Browser | Supabase Realtime | WSS |
| Browser | Firebase Auth | HTTPS |
| Browser | Google Maps JS | HTTPS |
| Vercel serverless | Supabase Postgres | HTTPS |
| Vercel serverless | Firebase Admin | HTTPS |
| Vercel serverless | Google Distance Matrix | HTTPS |
| Vercel serverless | LINE / Telegram APIs | HTTPS |

All external calls from API routes — not from browser for secrets (except public keys).

---

## Integration Test Checklist

| # | Test |
|---|------|
| 1 | Phone OTP login end-to-end |
| 2 | LINE login staging account |
| 3 | Supabase RLS two-tenant read block |
| 4 | Realtime location appears on dashboard |
| 5 | Optimize 10 stops with Maps (cache miss then hit) |
| 6 | FCM test push to guardian device |
| 7 | LINE push with org token |
| 8 | Telegram push with org bot |
| 9 | Photo upload to Storage + signed URL read |

---

## Related Documents

- [System overview](system-overview.md)
- [Monorepo structure](monorepo-structure.md)
- [Regulatory compliance](../research/regulatory-compliance.md)
- [ADRs](adr/)
