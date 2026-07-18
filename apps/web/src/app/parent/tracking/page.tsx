'use client';

import type { CheckIn, Passenger } from '@cmt/shared';
import { useEffect, useMemo, useState } from 'react';

import { GoogleMapsLoader } from '@/components/maps/GoogleMapsLoader';
import { LiveMap, type MapMarker } from '@/components/maps/LiveMap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc';
import { useResource } from '@/hooks/useResource';

function LatestEvent({ passengerId }: { passengerId: string }) {
  const { data } = useResource<CheckIn[]>(`/api/parent/checkins?passengerId=${passengerId}`);
  const latest = data?.[0];
  if (!latest) return <Badge tone="default">no events yet</Badge>;
  return (
    <Badge tone={latest.type === 'pickup' ? 'success' : 'info'}>
      {latest.type} · {new Date(latest.recordedAt).toLocaleTimeString()}
    </Badge>
  );
}

export default function ParentTrackingPage() {
  const { data: children, loading } = useResource<Passenger[]>('/api/parent/children');
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  const childIds = useMemo(() => (children ?? []).map((c) => c.id).join(','), [children]);

  useEffect(() => {
    if (!children) return;
    let cancelled = false;
    Promise.all(
      children.map(async (child) => {
        const res = await fetch(`/api/parent/checkins?passengerId=${child.id}`, { credentials: 'include' });
        const body = await res.json().catch(() => ({}));
        const latest = (body.data as CheckIn[] | undefined)?.[0];
        return latest ? { lat: latest.lat, lng: latest.lng, label: `${child.firstName}` } : null;
      })
    ).then((results) => {
      if (!cancelled) setMarkers(results.filter((m): m is NonNullable<typeof m> => m !== null));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childIds]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg font-semibold">Live tracking</h1>

      <GoogleMapsLoader>
        <LiveMap markers={markers} />
      </GoogleMapsLoader>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : !children || children.length === 0 ? (
        <EmptyState title="No children linked" hint="Ask your organization to link your account." />
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{child.grade ?? 'Passenger'}</p>
                </div>
                <LatestEvent passengerId={child.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
