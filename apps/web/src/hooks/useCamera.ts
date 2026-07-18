'use client';

import { useCallback, useState } from 'react';

/**
 * Lightweight photo capture using a hidden file input with `capture=environment`.
 * Returns a data URL suitable for preview and upload as check-in proof.
 */
export function useCamera() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve(null);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          setDataUrl(url);
          resolve(url);
        };
        reader.onerror = () => {
          setError('Failed to read photo');
          resolve(null);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }, []);

  const reset = useCallback(() => setDataUrl(null), []);

  return { dataUrl, error, capture, reset };
}
