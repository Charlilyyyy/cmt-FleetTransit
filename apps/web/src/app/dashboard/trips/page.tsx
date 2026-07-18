'use client';

import type { Trip, TripStatus } from '@cmt/shared';
import { useEffect } from 'react';

import { PageHeader } from '@/components/dashboard/ResourceTable';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeTrips } from '@/hooks/useRealtimeTrips';
import { mutateResource, useResource } from '@/hooks/useResource';

const STATUS_TONE: Record<TripStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  scheduled: 'info',
  active: 'success',
  completed: 'default',
  cancelled: 'danger',
};

export default function TripsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, loading, error, reload } = useResource<Trip[]>(`/api/trips?scheduledDate=${today}`);
  const { version, connected } = useRealtimeTrips();
  const { claims } = useAuth();

  const canEdit = claims?.role === 'admin' || claims?.role === 'superadmin';

  useEffect(() => {
    if (version > 0) reload();
  }, [version, reload]);

  async function transition(id: string, status: TripStatus) {
    await mutateResource(`/api/trips/${id}/status`, 'POST', { status });
    reload();
  }

  return (
    <div>
      <PageHeader title="Trips" description={`Live operations for ${today}.`} />
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-muted-foreground'}`} />
        {connected ? 'Live updates on' : 'Live updates offline'}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No trips scheduled today" hint="Schedule a trip from a route to see it here." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Trip</TH>
              <TH>Route</TH>
              <TH>Status</TH>
              <TH>Started</TH>
              {canEdit && <TH>Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {data.map((trip) => (
              <TR key={trip.id}>
                <TD>{trip.id.slice(0, 8)}</TD>
                <TD>{trip.routeId.slice(0, 8)}</TD>
                <TD>
                  <Badge tone={STATUS_TONE[trip.status]}>{trip.status}</Badge>
                </TD>
                <TD>{trip.actualStartAt ? new Date(trip.actualStartAt).toLocaleTimeString() : '—'}</TD>
                {canEdit && (
                  <TD className="space-x-2">
                    {trip.status === 'scheduled' && (
                      <Button size="sm" onClick={() => transition(trip.id, 'active')}>
                        Start
                      </Button>
                    )}
                    {trip.status === 'active' && (
                      <Button size="sm" onClick={() => transition(trip.id, 'completed')}>
                        Complete
                      </Button>
                    )}
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
