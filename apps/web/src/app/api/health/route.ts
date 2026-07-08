import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'cmt-fleet-transit',
    app: 'web',
    timestamp: new Date().toISOString(),
  });
}
