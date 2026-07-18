'use client';

import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useResource } from '@/hooks/useResource';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface ResourceTableProps<T> {
  url: string;
  columns: Column<T>[];
  emptyTitle: string;
  emptyHint?: string;
  getKey: (row: T) => string;
}

export function ResourceTable<T>({
  url,
  columns,
  emptyTitle,
  emptyHint,
  getKey,
}: ResourceTableProps<T>) {
  const { data, loading, error } = useResource<T[]>(url);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  return (
    <Table>
      <THead>
        <TR>
          {columns.map((col) => (
            <TH key={col.key}>{col.header}</TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {data.map((row) => (
          <TR key={getKey(row)}>
            {columns.map((col) => (
              <TD key={col.key}>{col.render(row)}</TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
