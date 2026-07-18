'use client';

import type { Vehicle } from '@cmt/shared';

import { PageHeader, ResourceTable, type Column } from '@/components/dashboard/ResourceTable';
import { Badge } from '@/components/ui/misc';

const columns: Column<Vehicle>[] = [
  { key: 'label', header: 'Label', render: (v) => v.label },
  { key: 'plate', header: 'Plate', render: (v) => v.licensePlate },
  { key: 'seats', header: 'Seats', render: (v) => v.seatCapacity },
  { key: 'type', header: 'Type', render: (v) => v.vehicleType ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <Badge tone={v.status === 'active' ? 'success' : 'default'}>{v.status}</Badge>,
  },
];

export default function VehiclesPage() {
  return (
    <div>
      <PageHeader title="Vehicles" description="Fleet vehicles and seat capacity." />
      <ResourceTable
        url="/api/vehicles"
        columns={columns}
        getKey={(v) => v.id}
        emptyTitle="No vehicles yet"
        emptyHint="Add a vehicle to start scheduling trips."
      />
    </div>
  );
}
