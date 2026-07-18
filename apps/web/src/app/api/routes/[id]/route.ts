import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const updateRouteSchema = z
  .object({
    schoolId: z.string().uuid().nullable(),
    vehicleId: z.string().uuid().nullable(),
    name: z.string().min(1).max(255),
    direction: z.enum(['pickup', 'dropoff']),
    isActive: z.boolean(),
  })
  .partial();

type Params = { params: { id: string } };

async function loadOwned(id: string, role: string, orgId: string | null) {
  const storage = getServerStorage();
  const route = await storage.routes.get(id);
  if (!route || !canAccessOrganization(role as never, orgId, route.organizationId)) {
    throw new ApiError('Not found', 404, 'NOT_FOUND');
  }
  return { storage, route };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('routes', 'read');
    const { storage, route } = await loadOwned(params.id, session.role, session.organizationId);
    const stops = await storage.routeStops.list(route.id);
    return NextResponse.json({ data: { ...route, stops } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('routes', 'update');
    const { storage, route } = await loadOwned(params.id, session.role, session.organizationId);
    const body = await parseBody(request, updateRouteSchema);
    const updated = await storage.routes.update(route.id, body);

    await writeAudit(storage, session, {
      action: 'route.update',
      entityType: 'route',
      entityId: route.id,
      organizationId: route.organizationId,
      metadata: { changed: Object.keys(body) },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('routes', 'delete');
    const { storage, route } = await loadOwned(params.id, session.role, session.organizationId);
    await storage.routes.update(route.id, { isActive: false });

    await writeAudit(storage, session, {
      action: 'route.delete',
      entityType: 'route',
      entityId: route.id,
      organizationId: route.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
