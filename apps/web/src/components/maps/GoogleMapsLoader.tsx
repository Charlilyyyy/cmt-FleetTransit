'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface MapsState {
  loaded: boolean;
  error: string | null;
}

const MapsContext = createContext<MapsState>({ loaded: false, error: null });

let loadPromise: Promise<void> | null = null;

function loadScript(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    const w = window as unknown as { google?: { maps?: unknown } };
    if (w.google?.maps) return resolve();

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function GoogleMapsLoader({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MapsState>({ loaded: false, error: null });

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setState({ loaded: false, error: 'NEXT_PUBLIC_GOOGLE_MAPS_KEY not set' });
      return;
    }
    loadScript(apiKey)
      .then(() => setState({ loaded: true, error: null }))
      .catch((err) => setState({ loaded: false, error: err.message }));
  }, []);

  return <MapsContext.Provider value={state}>{children}</MapsContext.Provider>;
}

export function useGoogleMaps(): MapsState {
  return useContext(MapsContext);
}
