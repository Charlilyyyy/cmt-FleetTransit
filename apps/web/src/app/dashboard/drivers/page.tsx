'use client';

import type { Driver } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<Driver>[] = [
  { key: 'user', header: 'User ID', render: (d) => d.userId },
  { key: 'license', header: 'License', render: (d) => d.licenseNumber ?? '—' },
  { key: 'expiry', header: 'Expiry', render: (d) => d.licenseExpiry ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (d) => <Badge tone={d.status === 'active' ? 'success' : 'default'}>{d.status}</Badge>,
  },
];

export default function DriversPage() {
  return (
    <div>
      <PageHeader title="Drivers" description="Drivers eligible for trip assignment." />
      <ResourceTable
        url="/api/drivers"
        columns={columns}
        getKey={(d) => d.id}
        emptyTitle="No drivers yet"
        emptyHint="Create a user with the driver role, then register them here."
      />
    </div>
  );
}
