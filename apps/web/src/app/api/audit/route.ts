import { NextResponse } from 'next/server';

import {
  getServerStorage,
  handleApiError,
  rateLimit,
  requirePermission,
  resolveOrgScope,
} from '@/lib/api';

/** Read the organization's audit trail. Restricted to admin/superadmin by RBAC. */
export async function GET(request: Request) {
  try {
    rateLimit(request, 60);
    const session = await requirePermission('auditLogs', 'read');
    const orgId = resolveOrgScope(session, new URL(request.url).searchParams.get('organizationId'));
    const storage = getServerStorage();
    const logs = await storage.auditLogs.list(orgId);
    return NextResponse.json({ data: logs });
  } catch (error) {
    return handleApiError(error);
  }
}
