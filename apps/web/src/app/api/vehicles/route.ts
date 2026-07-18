import { createVehicleSchema } from '@cmt/shared';
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
    const session = await requirePermission('vehicles', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const vehicles = await storage.vehicles.list(orgId);
    return NextResponse.json({ data: vehicles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('vehicles', 'create');
    const body = await parseBody(request, createVehicleSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const vehicle = await storage.vehicles.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'vehicle.create',
      entityType: 'vehicle',
      entityId: vehicle.id,
      organizationId: orgId,
      metadata: { label: vehicle.label, seatCapacity: vehicle.seatCapacity },
    });

    return NextResponse.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
