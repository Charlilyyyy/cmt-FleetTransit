'use client';

import type { AuditLog } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';

const columns: Column<AuditLog>[] = [
  { key: 'when', header: 'When', render: (a) => new Date(a.createdAt).toLocaleString() },
  { key: 'action', header: 'Action', render: (a) => a.action },
  { key: 'entity', header: 'Entity', render: (a) => `${a.entityType}:${a.entityId.slice(0, 8)}` },
  { key: 'actor', header: 'Actor', render: (a) => a.actorUserId ?? 'system' },
];

export default function AuditPage() {
  return (
    <div>
      <PageHeader title="Audit log" description="Every mutation, who performed it, and when." />
      <ResourceTable
        url="/api/audit"
        columns={columns}
        getKey={(a) => a.id}
        emptyTitle="No audit entries yet"
        emptyHint="Actions across the dashboard appear here."
      />
    </div>
  );
}
