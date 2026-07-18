import { createUserSchema } from '@cmt/shared';
import { NextResponse } from 'next/server';

import { writeAudit } from '@/lib/audit';
import {
  ApiError,
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
    const session = await requirePermission('users', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const users = await storage.users.list(orgId);
    return NextResponse.json({ data: users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('users', 'create');
    const body = await parseBody(request, createUserSchema);

    // Only superadmin can create superadmins or cross-org users.
    if (body.role === 'superadmin' && session.role !== 'superadmin') {
      throw new ApiError('Only superadmin can create superadmin users', 403, 'FORBIDDEN');
    }
    const orgId = resolveOrgScope(session, body.organizationId ?? undefined);

    const storage = getServerStorage();
    const user = await storage.users.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'user.create',
      entityType: 'user',
      entityId: user.id,
      organizationId: orgId,
      metadata: { role: user.role },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
