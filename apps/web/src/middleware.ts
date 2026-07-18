import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'cmt_session';

const PROTECTED_PREFIXES = ['/dashboard', '/parent', '/driver'];
const PROTECTED_API_PREFIXES = [
  '/api/organizations',
  '/api/schools',
  '/api/vehicles',
  '/api/drivers',
  '/api/passengers',
  '/api/users',
  '/api/routes',
  '/api/trips',
  '/api/audit',
];

/**
 * Edge middleware performs a cheap presence check on the session cookie.
 * Cryptographic verification (Firebase Admin) runs in Node route handlers and
 * server components via lib/session.ts.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const isProtectedPage = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtectedApi && !hasSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isProtectedPage && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/parent/:path*',
    '/driver/:path*',
    '/api/organizations/:path*',
    '/api/schools/:path*',
    '/api/vehicles/:path*',
    '/api/drivers/:path*',
    '/api/passengers/:path*',
    '/api/users/:path*',
    '/api/routes/:path*',
    '/api/trips/:path*',
    '/api/audit/:path*',
  ],
};
