import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  verifyIdToken,
} from '@cmt/auth';
import { getClientSafeError } from '@cmt/shared';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** Exchange a fresh Firebase ID token for an httpOnly session cookie. */
export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const sessionCookie = await createSessionCookie(idToken, SESSION_MAX_AGE_MS);

    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const safe = getClientSafeError(error);
    return NextResponse.json({ error: safe.message, code: safe.code }, { status: 500 });
  }
}

/** Clear the session cookie (logout). */
export async function DELETE() {
  cookies().delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
