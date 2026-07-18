'use client';

import { useEffect, useRef, useState } from 'react';

import { useGoogleMaps } from './GoogleMapsLoader';

export interface PickedLocation {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: PickedLocation | null;
  defaultCenter?: PickedLocation;
  onChange?: (location: PickedLocation) => void;
  height?: number;
}

/** Click-to-pick map. Falls back to numeric inputs when Maps is unavailable. */
export function LocationPicker({
  value,
  defaultCenter = { lat: 40.7128, lng: -74.006 },
  onChange,
  height = 320,
}: LocationPickerProps) {
  const { loaded, error } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<unknown>(null);
  const [manual, setManual] = useState<PickedLocation>(value ?? defaultCenter);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const g = (window as unknown as { google: any }).google; // eslint-disable-line @typescript-eslint/no-explicit-any
    const center = value ?? defaultCenter;
    const map = new g.maps.Map(mapRef.current, { center, zoom: 13 });
    const marker = new g.maps.Marker({ position: center, map, draggable: true });
    markerRef.current = marker;

    const emit = (pos: { lat: () => number; lng: () => number }) => {
      const next = { lat: pos.lat(), lng: pos.lng() };
      setManual(next);
      onChange?.(next);
    };

    map.addListener('click', (e: { latLng: { lat: () => number; lng: () => number } }) => {
      marker.setPosition(e.latLng);
      emit(e.latLng);
    });
    marker.addListener('dragend', () => emit(marker.getPosition()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="space-y-2">
        {error && <p className="text-sm text-destructive">{error}. Enter coordinates manually.</p>}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            value={manual.lat}
            onChange={(e) => {
              const next = { ...manual, lat: Number(e.target.value) };
              setManual(next);
              onChange?.(next);
            }}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm"
            placeholder="Latitude"
          />
          <input
            type="number"
            step="any"
            value={manual.lng}
            onChange={(e) => {
              const next = { ...manual, lng: Number(e.target.value) };
              setManual(next);
              onChange?.(next);
            }}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm"
            placeholder="Longitude"
          />
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ height }} className="w-full rounded-md border border-border" />;
}
