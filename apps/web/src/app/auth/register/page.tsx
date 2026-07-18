'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Organization self-registration request. New orgs are provisioned by a
 * superadmin after review, so this captures intent rather than creating a
 * tenant directly (see docs/auth/AUTH.md).
 */
export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ orgName: '', contactName: '', email: '', phone: '' });

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Provisioning endpoint lands with the core APIs; capture intent for now.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <h1 className="font-display text-2xl font-semibold">Request received</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks, {form.contactName || 'there'}. A superadmin will review {form.orgName || 'your organization'} and
          send onboarding steps to {form.email || 'your email'}.
        </p>
        <Link href="/auth/login" className="mt-6 text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-semibold">Register an organization</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about your fleet operation. Accounts are activated after review.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Organization name" value={form.orgName} onChange={update('orgName')} />
        <Field label="Contact name" value={form.contactName} onChange={update('contactName')} />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} />
        <Field label="Phone" type="tel" value={form.phone} onChange={update('phone')} placeholder="+15551234567" />
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
        >
          Request access
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
      />
    </label>
  );
}
