import { exchangeLineCode, fetchLineProfile, setUserClaims } from '@cmt/auth';
import { getClientSafeError } from '@cmt/shared';
import { NextResponse } from 'next/server';

import { getServerStorage } from '@/lib/supabase-server';

/**
 * LINE Login callback: exchange the authorization code, map the LINE user id
 * to an existing CMT user, and set custom claims. Session issuance still flows
 * through the Firebase custom-token bridge in the client.
 */
export async function POST(request: Request) {
  try {
    const { code, redirectUri } = (await request.json()) as {
      code?: string;
      redirectUri?: string;
    };
    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'code and redirectUri required' }, { status: 400 });
    }

    const token = await exchangeLineCode({ code, redirectUri });
    const profile = await fetchLineProfile(token.accessToken);

    // LINE users are provisioned with firebase_uid = "line:{lineUserId}" during onboarding.
    const storage = getServerStorage();
    const user = await storage.users.getByFirebaseUid(`line:${profile.lineUserId}`).catch(() => null);

    if (!user) {
      return NextResponse.json(
        { error: 'LINE account not linked to any CMT user', lineUserId: profile.lineUserId },
        { status: 403 }
      );
    }

    await setUserClaims(user.firebaseUid, {
      role: user.role,
      organizationId: user.organizationId ?? null,
      userId: user.id,
    });

    return NextResponse.json({ userId: user.id, role: user.role });
  } catch (error) {
    const safe = getClientSafeError(error);
    return NextResponse.json({ error: safe.message, code: safe.code }, { status: 500 });
  }
}
