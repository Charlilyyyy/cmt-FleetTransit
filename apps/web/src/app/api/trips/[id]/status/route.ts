import { canAccessOrganization } from '@cmt/auth';
import type { TripStatus } from '@cmt/shared';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const transitionSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
});

/** Allowed trip status transitions. */
const ALLOWED: Record<TripStatus, TripStatus[]> = {
  scheduled: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('trips', 'update');
    const storage = getServerStorage();
    const trip = await storage.trips.get(params.id);
    if (!trip || !canAccessOrganization(session.role, session.organizationId, trip.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }

    const { status } = await parseBody(request, transitionSchema);
    if (!ALLOWED[trip.status].includes(status)) {
      throw new ApiError(`Cannot transition from ${trip.status} to ${status}`, 409, 'INVALID_TRANSITION');
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status };
    if (status === 'active') patch.actualStartAt = now;
    if (status === 'completed') patch.actualEndAt = now;

    const updated = await storage.trips.update(trip.id, patch);

    await writeAudit(storage, session, {
      action: `trip.${status}`,
      entityType: 'trip',
      entityId: trip.id,
      organizationId: trip.organizationId,
      metadata: { from: trip.status, to: status },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
