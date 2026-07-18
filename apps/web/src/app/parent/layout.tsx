'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/parent/tracking', label: 'Tracking' },
  { href: '/parent/history', label: 'History' },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <span className="font-display font-semibold">CMT Fleet Transit</span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>
      <nav className="flex gap-2 border-b border-border px-4 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              pathname === tab.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
