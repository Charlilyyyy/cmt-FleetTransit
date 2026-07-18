'use client';

import { createBrowserClient } from '@cmt/storage';
import { useEffect, useState } from 'react';

/**
 * Subscribes to Supabase Realtime changes on the `trips` table and returns a
 * monotonically increasing version that consumers can watch to refetch.
 * No-ops gracefully when Supabase env vars are absent (e.g. local scaffold).
 */
export function useRealtimeTrips(): { version: number; connected: boolean } {
  const [version, setVersion] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let client;
    try {
      client = createBrowserClient();
    } catch {
      return;
    }

    const channel = client
      .channel('trips-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        setVersion((v) => v + 1);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_samples' }, () => {
        setVersion((v) => v + 1);
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      client?.removeChannel(channel);
    };
  }, []);

  return { version, connected };
}
