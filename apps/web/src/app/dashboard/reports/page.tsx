'use client';

import type { Trip } from '@cmt/shared';
import { useMemo } from 'react';

import { PageHeader } from '@/components/dashboard/ResourceTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { useResource } from '@/hooks/useResource';

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { data, loading } = useResource<Trip[]>('/api/trips');

  const stats = useMemo(() => {
    const trips = data ?? [];
    const total = trips.length;
    const completed = trips.filter((t) => t.status === 'completed').length;
    const cancelled = trips.filter((t) => t.status === 'cancelled').length;
    const active = trips.filter((t) => t.status === 'active').length;

    const onTime = trips.filter((t) => {
      if (!t.scheduledStartAt || !t.actualStartAt) return false;
      return new Date(t.actualStartAt).getTime() - new Date(t.scheduledStartAt).getTime() <= 5 * 60 * 1000;
    }).length;

    const started = trips.filter((t) => t.actualStartAt).length;

    return {
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      onTimeRate: started ? Math.round((onTime / started) * 100) : 0,
      cancelled,
      active,
      total,
    };
  }, [data]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Reports" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" description="Operational performance across all trips." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Trip completion" value={`${stats.completionRate}%`} hint={`${stats.total} total trips`} />
        <Metric label="On-time start" value={`${stats.onTimeRate}%`} hint="within 5 min of schedule" />
        <Metric label="Active now" value={String(stats.active)} />
        <Metric label="Cancelled" value={String(stats.cancelled)} />
      </div>
    </div>
  );
}
