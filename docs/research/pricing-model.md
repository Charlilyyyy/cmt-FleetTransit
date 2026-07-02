# Pricing Model

B2B SaaS pricing sketches for CMT Fleet Transit: **per organization**, **per vehicle**, and **per seat** models compared against [competitor pricing](competitor-matrix.md). Figures are directional for GTM planning — validate with pilot customers before publishing a public price page.

**Currency:** USD  
**Research date:** June 2026

---

## Pricing Goals

| Goal | How pricing supports it |
|------|-------------------------|
| Remove pilot friction | Free tier on self-deployable stack for first org |
| Match SMB mental models | Per-vehicle aligns with Samsara / OptimoRoute |
| Scale with operator size | Per-seat grows with passenger count |
| Simplify procurement | Per-org flat tier for small vendors |
| Beat enterprise school suites | 10× lower entry than $10k+ annual district deals |

---

## Model Comparison

| Model | Best for | Pros | Cons |
|-------|----------|------|------|
| **Per organization** | 1–15 vehicle vendors, predictable budget | Simple quote; easy upsell to higher tier | Under-monetizes large fleets |
| **Per vehicle** | Telematics-familiar buyers | Scales with fleet; comparable to incumbents | Discourages adding spare vehicles |
| **Per seat (passenger)** | School-per-passenger budgeting | Aligns with district funding norms | Harder to count; churn when enrollment drops |
| **Hybrid** | Growth stage | Balances predictability and fairness | More complex to explain |

**v1 GTM recommendation:** Lead with **per-vehicle** on monthly billing; offer **per-org Starter** for vendors under 5 buses. Introduce **per-seat** as optional quote for district-facing deals.

---

## Tier Sketch — Per Organization

Flat monthly fee by fleet band. Includes all core features; limits on vehicles and active passengers.

| Tier | Monthly | Vehicles included | Passengers | Schools | Support |
|------|---------|-------------------|------------|---------|---------|
| **Pilot** | $0 | 3 | 150 | 1 | Community / docs |
| **Starter** | $99 | 10 | 500 | 3 | Email |
| **Growth** | $299 | 30 | 2,000 | 10 | Email + onboarding call |
| **Scale** | Custom | Unlimited | Custom | Unlimited | SLA optional |

### What's included (all paid tiers)

- Route planning + Clarke-Wright optimization
- Live GPS + realtime dashboard
- Driver PWA + check-in (OTP; photo per org policy)
- Guardian tracking + FCM / LINE / Telegram notifications
- RBAC + audit log + basic reports

### Org-tier economics (illustrative)

| Tier | Est. infra cost / mo | Gross margin target |
|------|----------------------|---------------------|
| Pilot | $0–15 (free tier) | N/A — acquisition |
| Starter | $20–40 | > 60% |
| Growth | $50–120 | > 60% |
| Scale | Custom | Negotiated |

---

## Tier Sketch — Per Vehicle

Price per active vehicle per month. Familiar to buyers comparing Samsara ($30–50/vehicle) or OptimoRoute ($35–45/driver).

| Component | Price | Notes |
|-----------|-------|-------|
| **Base platform** | $25 / vehicle / mo | Min 3 vehicles; monthly or annual (-15%) |
| **Guardian notifications** | Included | FCM + one of LINE or Telegram |
| **Both LINE + Telegram** | +$3 / vehicle / mo | Regional premium |
| **Photo proof storage** | +$2 / vehicle / mo | When enabled; covers storage quota |
| **Extra schools (multi-site)** | +$15 / school / mo | After 3 schools included |

### Example quotes

| Operator profile | Fleet | Calculation | Monthly |
|------------------|-------|-------------|---------|
| Small school vendor | 5 buses | 5 × $25 | **$125** |
| Mid contractor | 20 buses | 20 × $25 | **$500** |
| + LINE premium | 20 buses | 20 × ($25 + $3) | **$560** |

**Positioning vs Samsara:** No hardware purchase; software-only at comparable per-vehicle rate with passenger + guardian features included.

---

## Tier Sketch — Per Seat (Passenger)

Price per registered passenger per month. Useful when **school** is the buyer and budgets are per-student.

| Band | Price / passenger / mo | Minimum monthly |
|------|------------------------|-----------------|
| 1–200 passengers | $0.75 | $99 |
| 201–1,000 | $0.50 | $150 |
| 1,001+ | $0.35 | Custom |

### Example quotes

| School / route set | Passengers | Calculation | Monthly |
|--------------------|------------|-------------|---------|
| Single elementary | 120 | max(120 × $0.75, $99) | **$99** (min) |
| K–8 district route | 450 | 450 × $0.50 | **$225** |
| Large contractor rollup | 2,500 | 2,500 × $0.35 | **$875** |

### When to use per-seat

| Use per-seat | Use per-vehicle instead |
|--------------|-------------------------|
| School signs contract directly | Independent bus vendor owns fleet |
| Funding tied to enrollment | Vendor prefers fleet-based opex |
| Passengers fluctuate seasonally | Stable vehicle count year-round |

---

## Pilot Pricing — $0 First Organization

Aligns with [differentiator D4](differentiators.md) free-tier stack.

| Pilot term | Terms |
|------------|-------|
| Duration | 90 days |
| Scope | ≤ 3 vehicles, 1 school, ≤ 150 passengers |
| Price | $0 software (customer may incur Maps API usage) |
| Conversion | Auto-quote Starter or per-vehicle at day 60 |
| Success metric | School-bus scenario complete per [success criteria](../discovery/success-criteria.md) |

**Why free works:** Competitors require annual commits or hardware. Pilot removes the "another $10k RFP" objection for SMB vendors.

---

## Add-Ons (Post-v1 or Premium)

| Add-on | Price sketch | Trigger |
|--------|--------------|---------|
| SSO / SAML | +$50 / org / mo | Enterprise school IT |
| Custom branding | +$30 / org / mo | White-label demand |
| API access (bulk) | +$40 / org / mo | Integrations |
| Extended photo retention | +$10 / org / mo | Compliance requests |
| Priority support | +15% of MRR | SLA |
| Dedicated Supabase region | Pass-through + 10% | Data residency contract |

Defer most add-ons until after MVP; list here so pricing conversations do not surprise the roadmap.

---

## Billing Mechanics

| Element | Recommendation |
|---------|----------------|
| Billing cycle | Monthly default; annual -15% |
| Payment | Stripe (card + invoice for Growth+) |
| Metering | Active vehicles per billing period; passengers = registered count snapshot |
| Trials | 90-day pilot, not credit-card 14-day |
| Overage | Soft cap warnings at 90% vehicle/passenger limit; hard cap or auto-upgrade |
| Churn | Export data window 30 days; DPA deletion on request |

---

## Unit Economics (Directional)

Assumptions for a **20-vehicle vendor** on per-vehicle pricing at $25/vehicle:

| Line item | Monthly |
|-----------|---------|
| Revenue | $500 |
| Infra (Supabase Pro, Vercel, Maps, notifications) | ~$80–150 |
| Support allocation (blended) | ~$50 |
| **Gross profit (est.)** | **~$300–370 (~60–74%)** |

Maps API is the largest variable cost — LRU cache and route batching from [differentiators](differentiators.md) protect margin.

---

## Competitive Price Position

| Competitor | Typical SMB annual | CMT Fleet Transit (20 vehicles) |
|------------|-------------------|--------------------------------|
| Transfinder | $10k–50k+ | ~$6k/yr ($500/mo) — **lower entry** |
| BusWhere | ~$7k–19k (20 × $30–80) | ~$6k/yr — **comparable, more features** |
| Samsara | ~$7k–12k + hardware | ~$6k/yr — **no hardware** |
| OptimoRoute | ~$8k–11k | ~$6k/yr — **+ guardian layer** |
| DIY (Sheets + WhatsApp) | $0 | Pilot $0 — **upgrade path when pain > cost** |

**Message:** Enterprise capability at SMB monthly opex, with a credible $0 pilot.

---

## Recommended Launch Pricing (Summary)

| Segment | Lead model | Launch price |
|---------|------------|--------------|
| SMB bus vendor (5–30 vehicles) | Per vehicle | **$25 / vehicle / month** |
| Micro vendor (< 5 vehicles) | Per org Starter | **$99 / month** |
| School-direct (enrollment-based) | Per seat | **$0.50 / passenger / month** (min $99) |
| First pilot | Pilot tier | **$0 for 90 days** |

Annual prepay: **15% discount**.

---

## Pricing Experiments to Run

| Experiment | Question | Method |
|------------|----------|--------|
| A | Will vendors pay $25 or only $15/vehicle? | A/B quote in 10 sales calls |
| B | Does per-org $99 beat per-vehicle for < 5 buses? | Offer both; track conversion |
| C | Do schools prefer per-seat quotes? | 3 school admin interviews |
| D | LINE premium worth $3/vehicle? | Bundle vs unbundle in SEA pilots |

Results feed [positioning-and-priorities.md](positioning-and-priorities.md) and eventual public pricing page.

---

## Open Pricing Questions

1. Should inactive seasonal vehicles get discounted off-season rates?
2. Pass-through Maps API overage to customer or absorb in margin?
3. Multi-school vendor: one org bill or sub-accounts per school?
4. Referral discount for school → vendor introductions?

---

## Related Documents

- [Competitor matrix](competitor-matrix.md)
- [Differentiators](differentiators.md)
- [Market landscape](market-landscape.md)
- [Positioning & priorities](positioning-and-priorities.md)
