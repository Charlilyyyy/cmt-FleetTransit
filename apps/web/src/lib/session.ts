import 'server-only';

import {
  fromDecodedToken,
  SESSION_COOKIE_NAME,
  verifySessionCookie,
  type SessionClaims,
} from '@cmt/auth';
import { cookies } from 'next/headers';

/** Read and verify the current session from the session cookie. Returns null when unauthenticated. */
export async function getSession(): Promise<SessionClaims | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;

  const decoded = await verifySessionCookie(cookie);
  if (!decoded) return null;

  return fromDecodedToken(decoded as unknown as Record<string, unknown>);
}

export async function requireSession(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }
  return session;
}
