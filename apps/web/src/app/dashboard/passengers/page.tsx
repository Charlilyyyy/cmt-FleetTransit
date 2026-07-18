'use client';

import type { Passenger } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<Passenger>[] = [
  { key: 'name', header: 'Name', render: (p) => `${p.firstName} ${p.lastName}` },
  { key: 'grade', header: 'Grade', render: (p) => p.grade ?? '—' },
  { key: 'stop', header: 'Default stop', render: (p) => p.defaultStopAddress ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (p) => <Badge tone={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>,
  },
];

export default function PassengersPage() {
  return (
    <div>
      <PageHeader title="Passengers" description="Riders assigned to schools and stops." />
      <ResourceTable
        url="/api/passengers"
        columns={columns}
        getKey={(p) => p.id}
        emptyTitle="No passengers yet"
        emptyHint="Add passengers to build routes and check-in lists."
      />
    </div>
  );
}
