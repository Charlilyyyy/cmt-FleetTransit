import { createDriverSchema } from '@cmt/shared';
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
    const session = await requirePermission('drivers', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const drivers = await storage.drivers.list(orgId);
    return NextResponse.json({ data: drivers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('drivers', 'create');
    const body = await parseBody(request, createDriverSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const driver = await storage.drivers.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'driver.create',
      entityType: 'driver',
      entityId: driver.id,
      organizationId: orgId,
      metadata: { userId: driver.userId },
    });

    return NextResponse.json({ data: driver }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
