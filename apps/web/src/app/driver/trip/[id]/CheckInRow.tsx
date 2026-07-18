'use client';

import type { RouteStop } from '@cmt/shared';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge, Input } from '@/components/ui/misc';
import { useCamera } from '@/hooks/useCamera';
import type { GeoSample } from '@/hooks/useGeolocation';

interface CheckInRowProps {
  stop: RouteStop;
  tripId: string;
  disabled: boolean;
  position: GeoSample | null;
  enqueue: (url: string, method: 'POST', body: unknown) => Promise<string>;
}

export function CheckInRow({ stop, tripId, disabled, position, enqueue }: CheckInRowProps) {
  const camera = useCamera();
  const [otp, setOtp] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function checkIn(type: 'pickup' | 'dropoff') {
    if (!stop.passengerId) return;
    setBusy(true);
    try {
      await enqueue(`/api/trips/${tripId}/checkin`, 'POST', {
        passengerId: stop.passengerId,
        routeStopId: stop.id,
        type,
        lat: position?.lat ?? stop.lat,
        lng: position?.lng ?? stop.lng,
        otp: otp || undefined,
        photoDataUrl: camera.dataUrl || undefined,
        clientEventId: crypto.randomUUID(),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            #{stop.sequence} {stop.addressLabel}
          </p>
          {stop.passengerId && (
            <p className="text-xs text-muted-foreground">Passenger {stop.passengerId.slice(0, 8)}</p>
          )}
        </div>
        {done && <Badge tone="success">done</Badge>}
      </div>

      {!done && stop.passengerId && (
        <div className="mt-3 space-y-2">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Passenger OTP (optional)"
            className="h-9"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => void camera.capture()} disabled={disabled}>
              {camera.dataUrl ? 'Photo ✓' : 'Photo'}
            </Button>
            <Button size="sm" onClick={() => checkIn('pickup')} disabled={disabled || busy}>
              Pickup
            </Button>
            <Button size="sm" variant="secondary" onClick={() => checkIn('dropoff')} disabled={disabled || busy}>
              Dropoff
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
