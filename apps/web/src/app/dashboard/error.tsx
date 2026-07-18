'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="font-display text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        This section failed to load. Your data is safe — try again.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
