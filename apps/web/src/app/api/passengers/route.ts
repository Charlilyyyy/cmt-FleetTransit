import { createPassengerSchema } from '@cmt/shared';
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
    const session = await requirePermission('passengers', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const passengers = await storage.passengers.list(orgId);
    return NextResponse.json({ data: passengers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('passengers', 'create');
    const body = await parseBody(request, createPassengerSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const passenger = await storage.passengers.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'passenger.create',
      entityType: 'passenger',
      entityId: passenger.id,
      organizationId: orgId,
      metadata: { schoolId: passenger.schoolId },
    });

    return NextResponse.json({ data: passenger }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
