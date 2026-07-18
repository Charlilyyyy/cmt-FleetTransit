import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const updateDriverSchema = z
  .object({
    licenseNumber: z.string().max(50),
    licenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
    emergencyContact: z.string(),
    status: z.enum(['active', 'inactive']),
  })
  .partial();

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('drivers', 'read');
    const storage = getServerStorage();
    const driver = await storage.drivers.get(params.id);
    if (!driver || !canAccessOrganization(session.role, session.organizationId, driver.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: driver });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('drivers', 'update');
    const storage = getServerStorage();
    const existing = await storage.drivers.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, updateDriverSchema);
    const updated = await storage.drivers.update(params.id, body);

    await writeAudit(storage, session, {
      action: 'driver.update',
      entityType: 'driver',
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
    const session = await requirePermission('drivers', 'delete');
    const storage = getServerStorage();
    const existing = await storage.drivers.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    await storage.drivers.update(params.id, { status: 'inactive' });

    await writeAudit(storage, session, {
      action: 'driver.delete',
      entityType: 'driver',
      entityId: params.id,
      organizationId: existing.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
