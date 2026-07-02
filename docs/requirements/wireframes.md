# Wireframes (Low-Fi)

ASCII wireframe sketches for key CMT Fleet Transit v1 flows. Reference for implementation — not pixel-perfect design. UI stack: Next.js + Tailwind + shadcn/ui.

**Flows:** Admin onboarding · Route planning · Live dashboard · Driver trip · Guardian tracking

---

## Admin Onboarding

Admin sets up organization fleet from empty state to first scheduled trip.

### Fleet setup wizard (dashboard)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CMT Fleet Transit          [Lincoln Transport ▼]     Admin ▾  Log out  │
├──────────────┬──────────────────────────────────────────────────────────┤
│  Overview    │  Setup progress  ████████░░  4/5                         │
│  Schools     │                                                          │
│  Vehicles    │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  Drivers     │  │ ✓ School    │ │ ✓ Vehicles  │ │ ✓ Drivers   │        │
│  Passengers  │  │ Lincoln Elem│ │ 3 registered│ │ 2 active    │        │
│  Routes      │  └─────────────┘ └─────────────┘ └─────────────┘        │
│  Trips       │                                                          │
│  Reports     │  ┌─────────────┐ ┌─────────────┐                         │
│  Settings    │  │ ✓ Passengers│ │ ○ First trip│  [ Continue setup → ]  │
│              │  │ 48 enrolled │ │ Not yet     │                         │
│              │  └─────────────┘ └─────────────┘                         │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### Add passenger dialog

```
┌──────────────────────────────────────┐
│  Add passenger                    ✕  │
├──────────────────────────────────────┤
│  Name         [ Maria Santos      ]  │
│  School       [ Lincoln Elementary▼] │
│  Default stop [ Oak St & 4th Ave  📍]│
│  Guardian     [ + Link guardian     ]│
│               Phone [ +1 555-0100   ]  │
│  OTP mode     (•) Daily  ( ) Static  │
├──────────────────────────────────────┤
│              [ Cancel ]  [ Save ]    │
└──────────────────────────────────────┘
```

---

## Route Planning

Admin creates route, places stops on map, runs optimizer.

### Route editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Routes  >  AM Pickup — Lincoln          [ Save draft ] [ Optimize 🔄 ] │
├──────────────────────────────┬──────────────────────────────────────────┤
│  Stops (drag to reorder)     │                                          │
│  ┌────────────────────────┐  │            🗺️ MAP VIEW                   │
│  │ 1. Depot               │  │                                          │
│  │ 2. Oak St & 4th        │  │      (1)───(2)───(3)───(4)───(5)        │
│  │ 3. Pine Ave & 12th     │  │                                          │
│  │ 4. Elm School gate     │  │      Click map to add stop [ + ]         │
│  │ 5. Lincoln Elementary│  │                                          │
│  └────────────────────────┘  │                                          │
│  Vehicle      [ Bus 12 (40 seats) ▼ ]                                   │
│  Est. total   42 min · 18.4 km                                          │
│  Passengers   12 / 40 capacity  ✓                                       │
└──────────────────────────────┴──────────────────────────────────────────┘
```

### Optimize result modal

```
┌──────────────────────────────────────┐
│  Optimization result              ✕  │
├──────────────────────────────────────┤
│  Saved 2.3 km vs previous order      │
│                                      │
│  New order: 1→3→2→4→5                │
│  [ Compare on map ]                  │
├──────────────────────────────────────┤
│  [ Keep original ]  [ Apply order ]  │
└──────────────────────────────────────┘
```

---

## Live Dashboard

Staff and Admin monitor active trips.

### Live ops board

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard — Live trips                    Mon Jun 29  7:42 AM          │
├──────────────────────────────┬──────────────────────────────────────────┤
│  Active (2)  Completed (1)   │                                          │
│  ┌────────────────────────┐  │         🗺️ LIVE MAP                      │
│  │ ● AM Lincoln — Bus 12  │  │                                          │
│  │   Driver: Juan D.      │  │    🚌 ← moving (2 min ago)               │
│  │   On time              │  │                                          │
│  ├────────────────────────┤  │              🚌                          │
│  │ ● AM Lincoln — Bus 07  │  │         (delayed +4m)                  │
│  │   Driver: Ana R.       │  │                                          │
│  │   Delayed +4m   ⚠      │  │                                          │
│  └────────────────────────┘  │                                          │
│  [ Search passenger...    ]  │  Legend: ● on time  ⚠ delayed           │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## Driver Trip

Mobile PWA — large touch targets, minimal navigation.

### Today's trip (before start)

```
┌─────────────────────────┐
│  CMT Driver        ≡    │
├─────────────────────────┤
│  Good morning, Juan     │
│                         │
│  TODAY                  │
│  ┌───────────────────┐  │
│  │ AM Lincoln Pickup │  │
│  │ Bus 12 · 12 pax   │  │
│  │ 7:15 AM start     │  │
│  │                   │  │
│  │  [  START TRIP  ] │  │
│  │   (large button)  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### Active trip — stop list

```
┌─────────────────────────┐
│  ● LIVE   GPS active    │
├─────────────────────────┤
│  Stop 3 of 5            │
│  Pine Ave & 12th        │
│                         │
│  Passengers expected:   │
│  ┌───────────────────┐  │
│  │ Maria S.  [Check in]│
│  │ Leo T.    [Check in]│
│  └───────────────────┘  │
│                         │
│  [ Navigate ] [ Next ▶]│
├─────────────────────────┤
│  [ END TRIP ]           │
└─────────────────────────┘
```

### Check-in screen

```
┌─────────────────────────┐
│  ← Back    Check in     │
├─────────────────────────┤
│  Maria Santos           │
│                         │
│  Enter passenger OTP    │
│  ┌─┬─┬─┬─┐              │
│  │ │ │ │ │              │
│  └─┴─┴─┴─┘              │
│                         │
│  [ 📷 Photo ] optional  │
│                         │
│  ┌───────────────────┐  │
│  │   CONFIRM CHECK-IN │  │
│  └───────────────────┘  │
│                         │
│  Offline: 2 pending ⬆   │
└─────────────────────────┘
```

---

## Guardian Tracking

Parent views linked child only — simple map-first layout.

### Tracking home

```
┌─────────────────────────┐
│  CMT Family        🔔   │
├─────────────────────────┤
│  Maria's bus            │
│  ┌───────────────────┐  │
│  │                   │  │
│  │    🗺️ Live map    │  │
│  │         🚌        │  │
│  │                   │  │
│  └───────────────────┘  │
│  Status:  En route      │
│  ETA:     ~8 min        │
│  Last:    12 sec ago    │
│                         │
│  Recent                 │
│  ✓ Checked in 7:38 AM   │
│                         │
│  [ Trip history ]       │
└─────────────────────────┘
```

### Notification (system)

```
┌─────────────────────────┐
│  CMT Fleet Transit      │
│  Maria boarded Bus 12   │
│  at Pine Ave · 7:38 AM  │
└─────────────────────────┘
```

---

## Auth — Login (shared pattern)

### Phone OTP

```
┌─────────────────────────┐
│  Sign in                │
├─────────────────────────┤
│  Phone number           │
│  [ +1 555-0199        ] │
│  [ Send code ]          │
│                         │
│  — or —                 │
│  [ Continue with LINE ] │
└─────────────────────────┘
```

---

## Navigation Map (roles)

| Role | Primary routes |
|------|----------------|
| SuperAdmin | `/admin/orgs`, org list |
| Admin | `/dashboard/*` full sidebar |
| Staff | `/dashboard` live + read-only entities |
| Driver | `/driver/today`, `/driver/trip/[id]` |
| Guardian | `/parent/tracking`, `/parent/history` |

---

## Component Notes (implementation hints)

| UI element | shadcn component |
|------------|------------------|
| Entity tables | `Table`, `Dialog`, `Select` |
| Map | `GoogleMapsLoader`, `map-picker` |
| Live states | `Skeleton` loading |
| Driver buttons | `Button` size `lg` |
| Forms | `Input`, `Label` |

---

## Flow → Epic Traceability

| Wireframe section | Epic |
|-------------------|------|
| Admin onboarding | E1, E2 |
| Route planning | E3 |
| Live dashboard | E6 |
| Driver trip | E4, E5, E10 |
| Guardian tracking | E7, E8 |

---

## Related Documents

- [MVP backlog](mvp-backlog.md)
- [User stories](user-stories.md)
- [PRD](prd.md)
