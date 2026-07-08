import { ROLES } from '@cmt/shared';
import { SupabaseAdapter } from '@cmt/storage';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'cmt-fleet-transit',
    app: 'web',
    packages: {
      shared: true,
      storage: typeof SupabaseAdapter === 'function',
    },
    roles: Object.values(ROLES),
    timestamp: new Date().toISOString(),
  });
}
