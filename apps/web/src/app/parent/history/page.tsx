'use client';

import type { CheckIn, Passenger } from '@cmt/shared';
import { useState } from 'react';

import { Badge, EmptyState, Select, Skeleton } from '@/components/ui/misc';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useResource } from '@/hooks/useResource';

export default function ParentHistoryPage() {
  const { data: children } = useResource<Passenger[]>('/api/parent/children');
  const [selected, setSelected] = useState<string>('');

  const passengerId = selected || children?.[0]?.id || '';
  const history = useResource<CheckIn[]>(
    passengerId ? `/api/parent/checkins?passengerId=${passengerId}` : null
  );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg font-semibold">History</h1>

      {children && children.length > 0 && (
        <Select value={passengerId} onChange={(e) => setSelected(e.target.value)}>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.firstName} {child.lastName}
            </option>
          ))}
        </Select>
      )}

      {history.loading ? (
        <Skeleton className="h-32 w-full" />
      ) : !history.data || history.data.length === 0 ? (
        <EmptyState title="No history yet" hint="Pickup and dropoff events will appear here." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>When</TH>
              <TH>Event</TH>
              <TH>Location</TH>
            </TR>
          </THead>
          <TBody>
            {history.data.map((event) => (
              <TR key={event.id}>
                <TD>{new Date(event.recordedAt).toLocaleString()}</TD>
                <TD>
                  <Badge tone={event.type === 'pickup' ? 'success' : 'info'}>{event.type}</Badge>
                </TD>
                <TD>
                  {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
