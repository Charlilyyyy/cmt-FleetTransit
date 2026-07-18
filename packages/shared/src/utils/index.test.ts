import { describe, expect, it } from 'vitest';

import { formatDistanceMeters, formatDuration, formatPhoneE164, haversineKm } from './index';

describe('formatPhoneE164', () => {
  it('keeps already-prefixed numbers', () => {
    expect(formatPhoneE164('+1 (555) 123-4567')).toBe('+15551234567');
  });

  it('expands a leading zero with the default country code', () => {
    expect(formatPhoneE164('0812345678', '66')).toBe('+66812345678');
  });
});

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    expect(haversineKm(40.7, -74, 40.7, -74)).toBe(0);
  });

  it('approximates a known distance', () => {
    // NYC to LA is ~3936 km.
    const d = haversineKm(40.7128, -74.006, 34.0522, -118.2437);
    expect(d).toBeGreaterThan(3900);
    expect(d).toBeLessThan(4000);
  });
});

describe('formatters', () => {
  it('formats duration', () => {
    expect(formatDuration(3661)).toBe('1h 1m');
    expect(formatDuration(120)).toBe('2m');
  });

  it('formats distance', () => {
    expect(formatDistanceMeters(500)).toBe('500m');
    expect(formatDistanceMeters(2500)).toBe('2.5km');
  });
});
