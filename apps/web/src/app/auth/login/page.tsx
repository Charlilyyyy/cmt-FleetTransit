import Link from 'next/link';

/** Placeholder until auth stage wires real login. */
export default function LoginPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        Authentication arrives in the next build stage. Use Health to verify the scaffold.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Home
        </Link>
        <Link href="/api/health" className="text-primary underline-offset-4 hover:underline">
          Health
        </Link>
      </div>
    </main>
  );
}
