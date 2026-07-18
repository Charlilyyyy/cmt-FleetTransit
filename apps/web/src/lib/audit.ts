import 'server-only';

import type { SessionClaims } from '@cmt/auth';
import type { SupabaseAdapter } from '@cmt/storage';

/** Record a mutation in audit_logs. Never throws into the request path. */
export async function writeAudit(
  storage: SupabaseAdapter,
  session: SessionClaims,
  params: {
    action: string;
    entityType: string;
    entityId: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await storage.auditLogs.create({
      organizationId: params.organizationId,
      actorUserId: session.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ?? {},
    });
  } catch (error) {
    console.error('Audit write failed:', error);
  }
}
