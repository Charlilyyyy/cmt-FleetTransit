'use client';

import type { School } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<School>[] = [
  { key: 'name', header: 'Name', render: (s) => s.name },
  { key: 'address', header: 'Address', render: (s) => s.address ?? '—' },
  { key: 'contact', header: 'Contact', render: (s) => s.contactName ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (s) => <Badge tone={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>,
  },
];

export default function SchoolsPage() {
  return (
    <div>
      <PageHeader title="Schools" description="Sites served by this organization." />
      <ResourceTable
        url="/api/schools"
        columns={columns}
        getKey={(s) => s.id}
        emptyTitle="No schools yet"
        emptyHint="Add a school to anchor passengers and routes."
      />
    </div>
  );
}
