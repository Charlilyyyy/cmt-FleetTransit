'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/driver" className="font-display font-semibold">
          Driver
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
