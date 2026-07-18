'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface GeoSample {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

interface GeoState {
  position: GeoSample | null;
  error: string | null;
  watching: boolean;
}

/** Watches device GPS. Call start()/stop() to control the watch. */
export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeoState>({ position: null, error: null, watching: false });
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setState((s) => ({ ...s, watching: false }));
    }
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation unsupported' }));
      return;
    }
    if (watchId.current !== null) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          },
          error: null,
          watching: true,
        });
      },
      (err) => setState((s) => ({ ...s, error: err.message, watching: false })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000, ...options }
    );
    setState((s) => ({ ...s, watching: true }));
  }, [options]);

  useEffect(() => stop, [stop]);

  return { ...state, start, stop };
}
