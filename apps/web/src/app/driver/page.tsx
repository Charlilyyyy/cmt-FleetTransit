'use client';

import type { Trip } from '@cmt/shared';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc';
import { useResource } from '@/hooks/useResource';

export default function DriverHome() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, loading } = useResource<Trip[]>(`/api/trips?scheduledDate=${today}`);

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-semibold">Today&apos;s trips</h1>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No trips assigned today" hint="Check back later or contact dispatch." />
      ) : (
        <div className="space-y-3">
          {data.map((trip) => (
            <Link key={trip.id} href={`/driver/trip/${trip.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">Trip {trip.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Route {trip.routeId.slice(0, 8)}</p>
                  </div>
                  <Badge tone={trip.status === 'active' ? 'success' : 'info'}>{trip.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
