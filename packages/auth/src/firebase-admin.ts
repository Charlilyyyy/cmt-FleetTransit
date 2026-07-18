import {
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

import { toCustomClaims, type SessionClaims } from './claims';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      'Missing Firebase Admin credentials: set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    );
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
    }),
  });
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch (error) {
    console.error('ID token verification failed:', error);
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresInMs: number): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: expiresInMs });
}

export async function verifySessionCookie(cookie: string): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifySessionCookie(cookie, true);
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}

export async function setUserClaims(
  uid: string,
  claims: Pick<SessionClaims, 'role' | 'organizationId' | 'userId'>
): Promise<void> {
  await getAdminAuth().setCustomUserClaims(uid, toCustomClaims(claims));
}

export async function revokeSessions(uid: string): Promise<void> {
  await getAdminAuth().revokeRefreshTokens(uid);
}

export type { DecodedIdToken };
