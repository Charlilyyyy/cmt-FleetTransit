# Out of Scope (v1)

Explicit deferrals for CMT Fleet Transit MVP. Items listed here are **not** in v1 unless the PRD is formally revised. Purpose: prevent scope creep during build.

**In scope reference:** [mvp-features.md](mvp-features.md) (F01–F20)

---

## Summary Table

| Item | Category | Revisit when |
|------|----------|--------------|
| Native iOS/Android store apps | Platform | iOS PWA GPS blocks pilot |
| AI demand prediction | Routing | 12+ months trip history exists |
| White-label branding | Enterprise | Paying customer requires it |
| Internationalization (i18n) | Localization | Second geography committed |
| SSO / SAML | Enterprise auth | School IT mandates it |
| Deep SIS integration | Integrations | District deal requires roster sync |
| Hardware telematics | Fleet hardware | Customer refuses phone-only |
| Billing / subscriptions | Commercial | Post-pilot monetization |
| SMS notifications | Messaging | LINE/FCM insufficient in market |
| Advanced geofencing | Guardian | P2 geofencing fails to satisfy |
| OpenAPI public API | Developer | Integration partner signed |
| SOC2 / formal certification | Compliance | Enterprise pipeline requires it |

---

## Platform and Client

### Native iOS and Android store apps

**Deferred:** App Store and Play Store distribution with native GPS background modes.

**Why:** Drivers and guardians can use PWA on phones they already own. Capacitor wrapper is P2 ([mvp-features](mvp-features.md) F25 path) if iOS Safari limits block pilot.

**Instead in v1:** `apps/web` driver routes + PWA manifest; optional Capacitor documented as fast follow.

---

### White-label branding

**Deferred:** Per-org custom logos, colors, domains (`busvendor.com` → white label).

**Why:** Design and deployment complexity without proven core workflow.

**Instead in v1:** Single CMT Fleet Transit brand; org name shown in dashboard header only.

---

## Intelligence and Routing

### AI demand prediction

**Deferred:** ML models for demand forecasting, dynamic route learning, predictive delays.

**Why:** No historical volume at launch; Clarke-Wright heuristic covers v1 optimization story.

**Instead in v1:** F05 Clarke-Wright + 2-opt with Google Maps distances.

---

### Multi-depot VRP at scale

**Deferred:** 100+ stops, heterogeneous fleet, time windows with complex constraints.

**Why:** Pilot is ≤ 50 stops per route; advanced VRP adds months of tuning.

**Instead in v1:** Single depot, capacity constraint, performance target 50 stops in < 2s.

---

## Localization and Access

### Internationalization (i18n)

**Deferred:** Multi-locale UI, RTL, translated templates for all strings.

**Why:** Pilot assumes single geography and language.

**Instead in v1:** English UI; notification templates editable per org in one language.

---

### SSO / SAML / OIDC enterprise auth

**Deferred:** Okta, Azure AD, Google Workspace SSO for school districts.

**Why:** SMB vendor pilots use phone + LINE login; enterprise procurement is post-PMF.

**Instead in v1:** F02 Firebase phone auth + LINE; email for admin optional.

---

## Integrations

### Deep SIS (Student Information System) integration

**Deferred:** Automatic roster sync from PowerSchool, Infinite Campus, etc.

**Why:** Per-district integration sales cycle; CSV import is enough for pilot (P2 F26).

**Instead in v1:** Manual passenger CRUD in dashboard.

---

### Public OpenAPI / webhook platform

**Deferred:** Documented public API for third-party developers, outbound webhooks.

**Why:** No integration partners at MVP; internal API routes sufficient.

**Instead in v1:** API contracts documented in markdown for maintainers only.

---

### Hardware telematics integration

**Deferred:** Samsara, Geotab, OBD-II dongles, dedicated GPS hardware.

**Why:** Capital-intensive, different buyer; software-only is positioning wedge.

**Instead in v1:** F07 phone GPS via browser geolocation.

---

## Messaging and Guardian

### SMS as primary channel

**Deferred:** Twilio SMS for all guardian alerts.

**Why:** Per-message cost; LINE/Telegram/FCM cover target markets.

**Instead in v1:** F11 FCM + F13 LINE + F14 Telegram.

---

### Public unauthenticated tracking links

**Deferred:** Shareable URL anyone can open to see bus location.

**Why:** Child safety and privacy risk; auth required per [regulatory compliance](../research/regulatory-compliance.md).

**Instead in v1:** F10 authenticated guardian portal only.

---

## Operations and Enterprise

### Billing and subscription management

**Deferred:** Stripe checkout, invoicing, plan upgrades in product.

**Why:** First pilot is $0; manual billing acceptable for customers 1–5.

**Instead in v1:** Pricing per [pricing model](../research/pricing-model.md); billing handled externally until post-pilot.

---

### Multi-org reseller / franchise hierarchy

**Deferred:** Parent org managing sub-orgs with revenue share.

**Why:** Single-level tenant model sufficient for bus vendors serving multiple schools.

**Instead in v1:** F01 one organization with many schools inside RLS boundary.

---

### Custom workflow builder

**Deferred:** Admin-configurable state machines for trip approval, etc.

**Why:** Over-engineering before one workflow is proven.

**Instead in v1:** Fixed trip status lifecycle in F06.

---

## Reports and Analytics

### Advanced analytics / BI dashboards

**Deferred:** Cohort analysis, fuel analytics, driver scorecards, custom report builder.

**Why:** F16 basic reports satisfy school-bus proof.

**Instead in v1:** Trip completion, attendance, on-time summary tables.

---

### Route efficiency benchmarking across orgs

**Deferred:** Anonymous cross-tenant benchmarks.

**Why:** Privacy and immature data volume.

**Instead in v1:** Per-org route metrics only.

---

## Security and Compliance

### Formal SOC2 Type II / ISO 27001

**Deferred:** Certified audit program.

**Why:** Cost and timeline; startup pilot runs on documented controls first.

**Instead in v1:** Security checklist, RLS tests, CSP, secrets scan (F20).

---

### Data residency region picker (self-serve)

**Deferred:** Customer selects EU-only / APAC-only Supabase region in UI.

**Why:** Manual provisioning acceptable for first enterprise contract.

**Instead in v1:** Single default region documented in deployment guide.

---

## P2 Features (Not v1 — Scheduled Fast Follow)

These appear in [research priorities](../research/positioning-and-priorities.md) as P2 — explicitly **not** MVP blockers:

| ID | Feature | Target |
|----|---------|--------|
| F21 | Billing hooks per school | 60–90 days post-launch |
| F22 | Guardian trip history (full) | 60–90 days |
| F23 | On-time performance report (advanced) | 60–90 days |
| F24 | Geofencing proximity alerts | 60–90 days |
| F25 | Capacitor native wrapper | If iOS PWA insufficient |
| F26 | Bulk passenger CSV import | Onboarding acceleration |

---

## Change Control

| Request type | Process |
|--------------|---------|
| Stakeholder asks for out-of-scope item | Log in backlog; do not add to sprint without PRD revision |
| Pilot blocker (e.g. iOS GPS) | Evaluate P2 F25 or minimal native shell; timebox spike |
| Enterprise deal requires SSO | Price as custom engagement; defer default MVP |

**Rule:** If it does not unblock the [school-bus anchor scenario](../discovery/success-criteria.md), it waits.

---

## Related Documents

- [MVP features](mvp-features.md)
- [PRD](prd.md)
- [Non-functional requirements](non-functional-requirements.md)
- [Positioning priorities](../research/positioning-and-priorities.md)
