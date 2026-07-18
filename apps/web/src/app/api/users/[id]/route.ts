import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const updateUserSchema = z
  .object({
    role: z.enum(['superadmin', 'admin', 'staff', 'driver', 'parent']),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string(),
    status: z.enum(['active', 'inactive']),
  })
  .partial();

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('users', 'read');
    const storage = getServerStorage();
    const user = await storage.users.get(params.id);
    if (!user || !canAccessOrganization(session.role, session.organizationId, user.organizationId ?? '')) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('users', 'update');
    const storage = getServerStorage();
    const existing = await storage.users.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId ?? '')) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, updateUserSchema);
    if (body.role === 'superadmin' && session.role !== 'superadmin') {
      throw new ApiError('Only superadmin can grant superadmin', 403, 'FORBIDDEN');
    }
    const updated = await storage.users.update(params.id, body);

    await writeAudit(storage, session, {
      action: 'user.update',
      entityType: 'user',
      entityId: params.id,
      organizationId: existing.organizationId ?? '',
      metadata: { changed: Object.keys(body) },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('users', 'delete');
    const storage = getServerStorage();
    const existing = await storage.users.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId ?? '')) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    await storage.users.update(params.id, { status: 'inactive' });

    await writeAudit(storage, session, {
      action: 'user.delete',
      entityType: 'user',
      entityId: params.id,
      organizationId: existing.organizationId ?? '',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
