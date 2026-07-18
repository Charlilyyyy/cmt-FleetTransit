'use client';

import type { Route } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<Route>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
  { key: 'direction', header: 'Direction', render: (r) => <Badge tone="info">{r.direction}</Badge> },
  {
    key: 'distance',
    header: 'Distance',
    render: (r) => (r.totalDistanceM ? `${(r.totalDistanceM / 1000).toFixed(1)} km` : '—'),
  },
  {
    key: 'duration',
    header: 'Est. duration',
    render: (r) => (r.estimatedDurationS ? `${Math.round(r.estimatedDurationS / 60)} min` : '—'),
  },
  {
    key: 'active',
    header: 'Active',
    render: (r) => <Badge tone={r.isActive ? 'success' : 'default'}>{r.isActive ? 'yes' : 'no'}</Badge>,
  },
];

export default function RoutesPage() {
  return (
    <div>
      <PageHeader title="Routes" description="Configured routes and optimization results." />
      <ResourceTable
        url="/api/routes"
        columns={columns}
        getKey={(r) => r.id}
        emptyTitle="No routes yet"
        emptyHint="Create a route, add stops, then optimize the order."
      />
    </div>
  );
}
