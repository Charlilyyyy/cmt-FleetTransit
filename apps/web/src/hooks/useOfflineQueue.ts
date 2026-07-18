'use client';

import { useCallback, useEffect, useState } from 'react';

const DB_NAME = 'cmt-offline';
const STORE = 'queue';

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'POST' | 'PATCH';
  body: unknown;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function allQueued(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

async function putQueued(item: QueuedRequest): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteQueued(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Durable offline queue for check-in / location writes. Enqueues to IndexedDB
 * and flushes to the network when connectivity returns.
 */
export function useOfflineQueue() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const items = await allQueued();
      setPending(items.length);
    } catch {
      setPending(0);
    }
  }, []);

  const flush = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    let items: QueuedRequest[] = [];
    try {
      items = await allQueued();
    } catch {
      return;
    }
    for (const item of items) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body),
        });
        if (res.ok) await deleteQueued(item.id);
      } catch {
        break; // Still offline; retry later.
      }
    }
    await refresh();
  }, [refresh]);

  const enqueue = useCallback(
    async (url: string, method: 'POST' | 'PATCH', body: unknown) => {
      const item: QueuedRequest = {
        id: crypto.randomUUID(),
        url,
        method,
        body,
        createdAt: Date.now(),
      };
      await putQueued(item);
      await refresh();
      await flush();
      return item.id;
    },
    [flush, refresh]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOnline(navigator.onLine);
    const goOnline = () => {
      setOnline(true);
      void flush();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    void refresh();
    void flush();
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [flush, refresh]);

  return { pending, online, enqueue, flush };
}
