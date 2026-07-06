# ADR-002: Use Firebase Phone Auth + LINE for Identity

**Status:** Accepted  
**Date:** 2026-06-29

## Context

Primary users authenticate on mobile: drivers in the field and guardians tracking children. Southeast Asian pilots require **LINE** as a first-class login and messaging channel. We need custom roles (`SuperAdmin`, `Admin`, `Staff`, `Driver`, `Parent / Guardian`) and `organization_id` on every session for RLS.

Alternatives: Supabase Auth only, Auth0, custom SMS OTP, magic email links.

## Decision

Use **Firebase Authentication** for phone OTP and **LINE Login** for regional OAuth:

1. Client obtains Firebase ID token (phone) or LINE authorization code
2. `POST /api/auth/verify` or `/api/auth/line` validates token server-side via Firebase Admin / LINE API
3. Server sets **custom claims**: `role`, `organization_id`
4. User profile synced to Supabase `users` table
5. HTTP-only **session cookie** issued for subsequent requests
6. Middleware reads session and attaches Supabase client with user context

RBAC helpers live in `packages/auth/rbac.ts`.

## Consequences

### Positive

- Phone OTP is familiar to drivers and guardians; no password management
- Firebase free tier scales for pilot
- Custom claims avoid DB lookup on every middleware check for role
- LINE Login addresses SEA market requirement without building OAuth from scratch

### Negative

- Split brain: identity in Firebase, fleet data in Supabase — sync required on first login
- Two auth vendors to configure and monitor
- iOS PWA session persistence quirks independent of auth provider

### Neutral

- Email login optional for admins; not required for v1 anchor scenario
- SuperAdmin may use separate bootstrap flow documented in implementation
