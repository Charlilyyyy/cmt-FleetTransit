'use client';

import { useEffect, useRef } from 'react';

import { useGoogleMaps } from './GoogleMapsLoader';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

/** Read-only map that plots markers. Falls back to a coordinate list without Maps. */
export function LiveMap({ markers, height = 320 }: { markers: MapMarker[]; height?: number }) {
  const { loaded, error } = useGoogleMaps();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded || !ref.current || markers.length === 0) return;
    const g = (window as unknown as { google: any }).google; // eslint-disable-line @typescript-eslint/no-explicit-any
    const map = new g.maps.Map(ref.current, { center: markers[0], zoom: 13 });
    const bounds = new g.maps.LatLngBounds();
    markers.forEach((m) => {
      new g.maps.Marker({ position: { lat: m.lat, lng: m.lng }, map, title: m.label });
      bounds.extend({ lat: m.lat, lng: m.lng });
    });
    if (markers.length > 1) map.fitBounds(bounds);
  }, [loaded, markers]);

  if (!loaded) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        {error ? `Map unavailable: ${error}` : 'Loading map…'}
        {markers.length > 0 && (
          <ul className="mt-2 space-y-1">
            {markers.map((m, i) => (
              <li key={i}>
                {m.label ?? 'Location'}: {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return <div ref={ref} style={{ height }} className="w-full rounded-md border border-border" />;
}
