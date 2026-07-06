# ADR-005: Use FCM, LINE, and Telegram for Notifications

**Status:** Accepted  
**Date:** 2026-06-29

## Context

Guardians must receive pickup/dropoff alerts within 30 seconds of check-in ([NFR-P03](../../requirements/non-functional-requirements.md)). US-centric SMS-only solutions fail in LINE-dominant markets. Incumbents lack unified multi-channel dispatch ([competitor matrix](../../research/competitor-matrix.md)).

Alternatives: SMS only (Twilio), email only, in-app polling without push, single-channel FCM.

## Decision

Build `packages/notifications` with channel adapters and unified `notification-service.ts`:

| Channel | Library | Config |
|---------|---------|--------|
| **FCM** | Firebase Admin | Project-level; guardian device tokens in DB |
| **LINE** | LINE Messaging API | Per-org channel access token in Supabase |
| **Telegram** | Bot API | Per-org bot token in Supabase |

Templates: `pickup`, `dropoff`, `delay`, `emergency` — org-customizable text with variable substitution.

Dispatch rules:

- Trigger on check-in/check-out events and admin broadcasts
- Try enabled channels per guardian preference and org config
- Log delivery status to `notifications` table
- FCM as default fallback when LINE/Telegram unavailable

## Consequences

### Positive

- Regional fit for SEA pilots without SMS per-message cost
- Single event pipeline regardless of channel count
- Marketing differentiator vs SMS-only school apps
- Guardian receives message on app they already use

### Negative

- Three integrations to maintain and test
- Per-org LINE/Telegram onboarding friction for admins
- Delivery guarantees vary by channel (FCM vs LINE vs Telegram policies)

### Neutral

- SMS deferred to post-v1 unless pilot feedback requires it
- WhatsApp Business API not in scope (policy and cost complexity)
