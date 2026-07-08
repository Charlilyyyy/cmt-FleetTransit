import { ROLES } from '@cmt/shared';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'cmt-fleet-transit',
    app: 'web',
    packages: { shared: true },
    roles: Object.values(ROLES),
    timestamp: new Date().toISOString(),
  });
}
