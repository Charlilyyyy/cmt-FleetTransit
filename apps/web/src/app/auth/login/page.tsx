'use client';

import { getFirebaseAuth, homeRouteForRole } from '@cmt/auth';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmation = useRef<ConfirmationResult | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      confirmation.current = await signInWithPhoneNumber(auth, phone, verifier);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!confirmation.current) throw new Error('Request a code first');
      const cred = await confirmation.current.confirm(code);
      const idToken = await cred.user.getIdToken();

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json();
        throw new Error(body.error ?? 'Verification failed');
      }
      const { role } = await verifyRes.json();

      // Refresh token so the session cookie carries updated claims.
      const freshToken = await cred.user.getIdToken(true);
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: freshToken }),
      });

      router.push(params.get('next') ?? homeRouteForRole(role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        CMT Fleet Transit uses phone verification.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 'phone' ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Phone number
            <input
              type="tel"
              required
              placeholder="+15551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Verification code
            <input
              inputMode="numeric"
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? 'Verifying…' : 'Verify & sign in'}
          </button>
        </form>
      )}

      <div id="recaptcha-container" />

      <p className="mt-6 text-sm text-muted-foreground">
        Need an organization account?{' '}
        <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}
