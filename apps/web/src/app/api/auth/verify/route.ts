import { setUserClaims, verifyIdToken } from '@cmt/auth';
import { getClientSafeError } from '@cmt/shared';
import { NextResponse } from 'next/server';

import { getServerStorage } from '@/lib/supabase-server';

/**
 * Verify a Firebase ID token, sync the user row, and set custom claims
 * (role, organization_id) so subsequent tokens/session carry tenant scope.
 */
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

    const storage = getServerStorage();
    const user = await storage.users.getByFirebaseUid(decoded.uid);
    if (!user) {
      return NextResponse.json({ error: 'No profile for this account' }, { status: 403 });
    }

    await setUserClaims(decoded.uid, {
      role: user.role,
      organizationId: user.organizationId ?? null,
      userId: user.id,
    });

    return NextResponse.json({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId ?? null,
    });
  } catch (error) {
    const safe = getClientSafeError(error);
    return NextResponse.json({ error: safe.message, code: safe.code }, { status: 500 });
  }
}
