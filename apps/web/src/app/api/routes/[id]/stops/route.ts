import { canAccessOrganization } from '@cmt/auth';
import { createRouteStopSchema } from '@cmt/shared';
import { NextResponse } from 'next/server';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('routes', 'read');
    const storage = getServerStorage();
    const route = await storage.routes.get(params.id);
    if (!route || !canAccessOrganization(session.role, session.organizationId, route.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const stops = await storage.routeStops.list(route.id);
    return NextResponse.json({ data: stops });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('routes', 'update');
    const storage = getServerStorage();
    const route = await storage.routes.get(params.id);
    if (!route || !canAccessOrganization(session.role, session.organizationId, route.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, createRouteStopSchema);
    const stop = await storage.routeStops.create({
      ...body,
      routeId: route.id,
      organizationId: route.organizationId,
    });

    await writeAudit(storage, session, {
      action: 'route.addStop',
      entityType: 'route_stop',
      entityId: stop.id,
      organizationId: route.organizationId,
      metadata: { routeId: route.id, sequence: stop.sequence },
    });

    return NextResponse.json({ data: stop }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
