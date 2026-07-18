import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
  recordedAt: z.string().datetime({ offset: true }).optional(),
});

type Params = { params: { id: string } };

/** Driver GPS broadcast. Appends a location sample to the trip's track. */
export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('trips', 'update');
    const storage = getServerStorage();
    const trip = await storage.trips.get(params.id);
    if (!trip || !canAccessOrganization(session.role, session.organizationId, trip.organizationId)) {
      throw new ApiError('Trip not found', 404, 'NOT_FOUND');
    }
    if (trip.status !== 'active') {
      throw new ApiError('Trip is not active', 409, 'TRIP_INACTIVE');
    }

    const body = await parseBody(request, locationSchema);
    const sample = await storage.locations.append({
      organizationId: trip.organizationId,
      tripId: trip.id,
      driverId: trip.driverId,
      lat: body.lat,
      lng: body.lng,
      heading: body.heading ?? null,
      speed: body.speed ?? null,
      accuracy: body.accuracy ?? null,
    });

    return NextResponse.json({ data: sample }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
