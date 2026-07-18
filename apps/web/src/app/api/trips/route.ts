import { createTripSchema } from '@cmt/shared';
import { NextResponse } from 'next/server';

import { writeAudit } from '@/lib/audit';
import {
  getServerStorage,
  handleApiError,
  parseBody,
  rateLimit,
  requirePermission,
  resolveOrgScope,
} from '@/lib/api';

export async function GET(request: Request) {
  try {
    rateLimit(request, 60);
    const session = await requirePermission('trips', 'read');
    const url = new URL(request.url);
    const orgId = resolveOrgScope(session, url.searchParams.get('organizationId'));
    const storage = getServerStorage();
    const trips = await storage.trips.list(orgId, {
      scheduledDate: url.searchParams.get('scheduledDate') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    });
    return NextResponse.json({ data: trips });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('trips', 'create');
    const body = await parseBody(request, createTripSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const trip = await storage.trips.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'trip.create',
      entityType: 'trip',
      entityId: trip.id,
      organizationId: orgId,
      metadata: { routeId: trip.routeId, scheduledDate: trip.scheduledDate },
    });

    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
