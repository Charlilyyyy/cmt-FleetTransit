import { canAccessOrganization } from '@cmt/auth';
import { RouteOptimizer, type OptimizeStop } from '@cmt/routing';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import {
  ApiError,
  getServerStorage,
  handleApiError,
  parseBody,
  rateLimit,
  requirePermission,
} from '@/lib/api';

const optimizeSchema = z.object({
  routeId: z.string().uuid(),
  depot: z.object({ lat: z.number(), lng: z.number() }),
  persist: z.boolean().default(true),
});

/**
 * Optimize the stop order for a route using its vehicle's seat capacity.
 * Persists the resulting sequence and route totals unless `persist` is false.
 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 20);
    const session = await requirePermission('routes', 'update');
    const body = await parseBody(request, optimizeSchema);

    const storage = getServerStorage();
    const route = await storage.routes.get(body.routeId);
    if (!route || !canAccessOrganization(session.role, session.organizationId, route.organizationId)) {
      throw new ApiError('Route not found', 404, 'NOT_FOUND');
    }

    const stops = await storage.routeStops.list(route.id);
    if (stops.length === 0) {
      throw new ApiError('Route has no stops to optimize', 400, 'NO_STOPS');
    }

    let capacity = 40;
    if (route.vehicleId) {
      const vehicle = await storage.vehicles.get(route.vehicleId);
      if (vehicle) capacity = vehicle.seatCapacity;
    }

    const optimizeStops: OptimizeStop[] = stops.map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      demand: 1,
      label: s.addressLabel,
    }));

    const result = await new RouteOptimizer().optimize({
      depot: body.depot,
      stops: optimizeStops,
      vehicleCapacity: capacity,
      direction: route.direction,
    });

    if (body.persist) {
      const order = result.routes.flatMap((r) => r.order);
      await Promise.all(
        order.map((stopId, idx) => storage.routeStops.update(stopId, { sequence: idx + 1 }))
      );
      await storage.routes.update(route.id, {
        totalDistanceM: result.totalDistanceM,
        estimatedDurationS: result.estimatedDurationS,
      });
    }

    await writeAudit(storage, session, {
      action: 'route.optimize',
      entityType: 'route',
      entityId: route.id,
      organizationId: route.organizationId,
      metadata: {
        stops: stops.length,
        totalDistanceM: result.totalDistanceM,
        computeMs: result.computeMs,
        live: result.usedLiveDistances,
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
