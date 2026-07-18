import { createRouteSchema } from '@cmt/shared';
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
    const session = await requirePermission('routes', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const routes = await storage.routes.list(orgId);
    return NextResponse.json({ data: routes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('routes', 'create');
    const body = await parseBody(request, createRouteSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const route = await storage.routes.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'route.create',
      entityType: 'route',
      entityId: route.id,
      organizationId: orgId,
      metadata: { name: route.name, direction: route.direction },
    });

    return NextResponse.json({ data: route }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
