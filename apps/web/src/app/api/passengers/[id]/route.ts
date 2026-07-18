import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const updatePassengerSchema = z
  .object({
    schoolId: z.string().uuid(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    grade: z.string().max(50),
    defaultStopLat: z.number().min(-90).max(90),
    defaultStopLng: z.number().min(-180).max(180),
    defaultStopAddress: z.string().max(500),
    status: z.enum(['active', 'inactive']),
  })
  .partial();

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('passengers', 'read');
    const storage = getServerStorage();
    const passenger = await storage.passengers.get(params.id);
    if (!passenger || !canAccessOrganization(session.role, session.organizationId, passenger.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: passenger });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('passengers', 'update');
    const storage = getServerStorage();
    const existing = await storage.passengers.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, updatePassengerSchema);
    const updated = await storage.passengers.update(params.id, body);

    await writeAudit(storage, session, {
      action: 'passenger.update',
      entityType: 'passenger',
      entityId: params.id,
      organizationId: existing.organizationId,
      metadata: { changed: Object.keys(body) },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('passengers', 'delete');
    const storage = getServerStorage();
    const existing = await storage.passengers.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    await storage.passengers.update(params.id, { status: 'inactive' });

    await writeAudit(storage, session, {
      action: 'passenger.delete',
      entityType: 'passenger',
      entityId: params.id,
      organizationId: existing.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
