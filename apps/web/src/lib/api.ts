import 'server-only';

import { can, type Action, type Resource, type SessionClaims } from '@cmt/auth';
import { getClientSafeError } from '@cmt/shared';
import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

import { getSession } from '@/lib/session';
import { getServerStorage } from '@/lib/supabase-server';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'API_ERROR'
  ) {
    super(message);
  }
}

/** Verify the session or throw 401. */
export async function requireSession(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHENTICATED');
  }
  return session;
}

/** Verify session and RBAC permission for a resource action. */
export async function requirePermission(resource: Resource, action: Action): Promise<SessionClaims> {
  const session = await requireSession();
  if (!can(session.role, resource, action)) {
    throw new ApiError('Forbidden', 403, 'FORBIDDEN');
  }
  return session;
}

/** Resolve the organization scope for queries; superadmin may pass an explicit org. */
export function resolveOrgScope(session: SessionClaims, requestedOrgId?: string | null): string {
  if (session.role === 'superadmin') {
    const org = requestedOrgId ?? session.organizationId;
    if (!org) {
      throw new ApiError('organizationId required for superadmin', 400, 'ORG_REQUIRED');
    }
    return org;
  }
  if (!session.organizationId) {
    throw new ApiError('No organization scope', 403, 'NO_ORG');
  }
  if (requestedOrgId && requestedOrgId !== session.organizationId) {
    throw new ApiError('Cross-tenant access denied', 403, 'CROSS_TENANT');
  }
  return session.organizationId;
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError('Invalid JSON body', 400, 'BAD_JSON');
  }
  try {
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      const detail = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ApiError(`Validation failed: ${detail}`, 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  const safe = getClientSafeError(error);
  return NextResponse.json({ error: safe.message, code: safe.code }, { status: 500 });
}

export { getServerStorage };

// --- Simple in-memory rate limiter (per-instance; 10 req/min per IP by default) ---
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, limit = 10, windowMs = 60_000): void {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const key = `${ip}:${new URL(request.url).pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new ApiError('Too many requests', 429, 'RATE_LIMIT');
  }
}
