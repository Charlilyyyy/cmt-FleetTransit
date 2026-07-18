'use client';

import type { RouteStop, Trip } from '@cmt/shared';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge, Skeleton } from '@/components/ui/misc';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { mutateResource, useResource } from '@/hooks/useResource';

import { CheckInRow } from './CheckInRow';

const LOCATION_INTERVAL_MS = 5000;

export default function DriverTripPage({ params }: { params: { id: string } }) {
  const trip = useResource<Trip>(`/api/trips/${params.id}`);
  const route = useResource<{ stops: RouteStop[] }>(
    trip.data ? `/api/routes/${trip.data.routeId}` : null
  );
  const geo = useGeolocation();
  const queue = useOfflineQueue();
  const [busy, setBusy] = useState(false);
  const lastSent = useRef(0);

  const status = trip.data?.status;

  // Broadcast GPS while the trip is active.
  useEffect(() => {
    if (status === 'active' && !geo.watching) geo.start();
    if (status !== 'active' && geo.watching) geo.stop();
  }, [status, geo]);

  useEffect(() => {
    if (status !== 'active' || !geo.position) return;
    const now = Date.now();
    if (now - lastSent.current < LOCATION_INTERVAL_MS) return;
    lastSent.current = now;
    const { lat, lng, heading, speed, accuracy } = geo.position;
    void queue.enqueue(`/api/trips/${params.id}/location`, 'POST', {
      lat,
      lng,
      heading,
      speed,
      accuracy,
    });
  }, [geo.position, status, params.id, queue]);

  async function transition(next: 'active' | 'completed') {
    setBusy(true);
    try {
      await mutateResource(`/api/trips/${params.id}/status`, 'POST', { status: next });
      trip.reload();
    } finally {
      setBusy(false);
    }
  }

  if (trip.loading) return <Skeleton className="h-40 w-full" />;
  if (trip.error || !trip.data) return <p className="text-sm text-destructive">{trip.error ?? 'Not found'}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold">Trip {trip.data.id.slice(0, 8)}</h1>
        <Badge tone={status === 'active' ? 'success' : 'info'}>{status}</Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${queue.online ? 'bg-green-500' : 'bg-amber-500'}`} />
        {queue.online ? 'Online' : `Offline — ${queue.pending} queued`}
        {geo.watching && <span>· GPS on{geo.position ? ` (±${Math.round(geo.position.accuracy)}m)` : ''}</span>}
      </div>

      {status === 'scheduled' && (
        <Button onClick={() => transition('active')} disabled={busy} className="w-full">
          Start trip
        </Button>
      )}
      {status === 'active' && (
        <Button onClick={() => transition('completed')} disabled={busy} variant="secondary" className="w-full">
          Complete trip
        </Button>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Stops</h2>
        {route.loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="space-y-2">
            {(route.data?.stops ?? []).map((stop) => (
              <CheckInRow
                key={stop.id}
                stop={stop}
                tripId={params.id}
                disabled={status !== 'active'}
                position={geo.position}
                enqueue={queue.enqueue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
