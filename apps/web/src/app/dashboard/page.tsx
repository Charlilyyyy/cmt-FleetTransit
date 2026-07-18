'use client';

import type { Trip, Vehicle, Driver, Route } from '@cmt/shared';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { useResource } from '@/hooks/useResource';

function StatCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const today = new Date().toISOString().slice(0, 10);
  const trips = useResource<Trip[]>(`/api/trips?scheduledDate=${today}`);
  const vehicles = useResource<Vehicle[]>('/api/vehicles');
  const drivers = useResource<Driver[]>('/api/drivers');
  const routes = useResource<Route[]>('/api/routes');

  const activeTrips = trips.data?.filter((t) => t.status === 'active').length ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Daily operations at a glance for {today}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Trips today" value={trips.data?.length ?? 0} loading={trips.loading} />
        <StatCard label="Active now" value={activeTrips} loading={trips.loading} />
        <StatCard label="Vehicles" value={vehicles.data?.length ?? 0} loading={vehicles.loading} />
        <StatCard label="Drivers" value={drivers.data?.length ?? 0} loading={drivers.loading} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.loading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {routes.data?.length ?? 0} route(s) configured. Monitor live trips under Trips.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
