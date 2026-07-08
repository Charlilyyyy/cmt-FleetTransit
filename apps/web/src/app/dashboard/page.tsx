import Link from 'next/link';

/** Placeholder shell until dashboard features land. */
export default function DashboardPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Operator overview will mount here after authentication and domain APIs.
      </p>
      <Link href="/" className="mt-6 text-primary underline-offset-4 hover:underline">
        Back home
      </Link>
    </main>
  );
}
