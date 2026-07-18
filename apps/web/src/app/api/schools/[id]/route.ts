import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';
import { z } from 'zod';

const updateSchoolSchema = z
  .object({
    name: z.string().min(1).max(255),
    address: z.string().max(500),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    contactName: z.string().max(100),
    contactPhone: z.string(),
    status: z.enum(['active', 'inactive']),
  })
  .partial();

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('schools', 'read');
    const storage = getServerStorage();
    const school = await storage.schools.get(params.id);
    if (!school || !canAccessOrganization(session.role, session.organizationId, school.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: school });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('schools', 'update');
    const storage = getServerStorage();
    const existing = await storage.schools.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, updateSchoolSchema);
    const updated = await storage.schools.update(params.id, body);

    await writeAudit(storage, session, {
      action: 'school.update',
      entityType: 'school',
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
    const session = await requirePermission('schools', 'delete');
    const storage = getServerStorage();
    const existing = await storage.schools.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    // Soft delete via status to preserve audit history and referential integrity.
    await storage.schools.update(params.id, { status: 'inactive' });

    await writeAudit(storage, session, {
      action: 'school.delete',
      entityType: 'school',
      entityId: params.id,
      organizationId: existing.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
