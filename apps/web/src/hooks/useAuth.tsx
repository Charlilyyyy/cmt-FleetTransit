'use client';

import { getFirebaseAuth, type FirebaseUser } from '@cmt/auth';
import type { UserRole } from '@cmt/shared';
import {
  onIdTokenChanged,
  signInWithCustomToken,
  signOut as fbSignOut,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthClaims {
  userId: string;
  role: UserRole;
  organizationId: string | null;
}

interface AuthState {
  user: FirebaseUser | null;
  claims: AuthClaims | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function readClaims(token: Record<string, unknown> | undefined): AuthClaims | null {
  if (!token) return null;
  const role = token.role as UserRole | undefined;
  const userId = (token.user_id as string | undefined) ?? (token.sub as string | undefined);
  if (!role || !userId) return null;
  return {
    userId,
    role,
    organizationId: (token.organization_id as string | null) ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [claims, setClaims] = useState<AuthClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const result = await nextUser.getIdTokenResult();
        setClaims(readClaims(result.claims as Record<string, unknown>));
      } else {
        setClaims(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
    await fetch('/api/auth/session', { method: 'DELETE' });
  }, []);

  const refresh = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (current) {
      const result = await current.getIdTokenResult(true);
      setClaims(readClaims(result.claims as Record<string, unknown>));
    }
  }, []);

  const value = useMemo(
    () => ({ user, claims, loading, signOut, refresh }),
    [user, claims, loading, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/** Bridge a Firebase custom token (e.g. from LINE flow) into a client session. */
export async function signInWithCmtCustomToken(customToken: string): Promise<void> {
  await signInWithCustomToken(getFirebaseAuth(), customToken);
}
