'use client';

import type { User } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
  { key: 'role', header: 'Role', render: (u) => <Badge tone="info">{u.role}</Badge> },
  { key: 'phone', header: 'Phone', render: (u) => u.phone ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (u) => <Badge tone={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge>,
  },
];

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Users" description="Team members and their access roles." />
      <ResourceTable
        url="/api/users"
        columns={columns}
        getKey={(u) => u.id}
        emptyTitle="No users yet"
        emptyHint="Invite admins, staff, and drivers to your organization."
      />
    </div>
  );
}
