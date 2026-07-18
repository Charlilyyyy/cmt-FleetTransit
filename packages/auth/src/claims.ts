import type { UserRole } from '@cmt/shared';

/** Custom claims mirrored into the Firebase ID token and the session cookie. */
export interface SessionClaims {
  userId: string;
  role: UserRole;
  organizationId: string | null;
  firebaseUid: string;
}

export const CLAIM_ROLE = 'role';
export const CLAIM_ORGANIZATION_ID = 'organization_id';
export const CLAIM_USER_ID = 'user_id';

export function toCustomClaims(claims: Pick<SessionClaims, 'role' | 'organizationId' | 'userId'>) {
  return {
    [CLAIM_ROLE]: claims.role,
    [CLAIM_ORGANIZATION_ID]: claims.organizationId,
    [CLAIM_USER_ID]: claims.userId,
  };
}

export function fromDecodedToken(decoded: Record<string, unknown>): SessionClaims | null {
  const role = decoded[CLAIM_ROLE] as UserRole | undefined;
  const uid = (decoded.uid ?? decoded.sub) as string | undefined;
  const userId = (decoded[CLAIM_USER_ID] as string | undefined) ?? uid;
  if (!role || !uid || !userId) {
    return null;
  }
  return {
    userId,
    role,
    organizationId: (decoded[CLAIM_ORGANIZATION_ID] as string | null) ?? null,
    firebaseUid: uid,
  };
}
