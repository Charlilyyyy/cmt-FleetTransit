import { createSchoolSchema } from '@cmt/shared';
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
    const session = await requirePermission('schools', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const schools = await storage.schools.list(orgId);
    return NextResponse.json({ data: schools });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    rateLimit(request);
    const session = await requirePermission('schools', 'create');
    const body = await parseBody(request, createSchoolSchema);
    const orgId = resolveOrgScope(session, body.organizationId);

    const storage = getServerStorage();
    const school = await storage.schools.create({ ...body, organizationId: orgId });

    await writeAudit(storage, session, {
      action: 'school.create',
      entityType: 'school',
      entityId: school.id,
      organizationId: orgId,
      metadata: { name: school.name },
    });

    return NextResponse.json({ data: school }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
