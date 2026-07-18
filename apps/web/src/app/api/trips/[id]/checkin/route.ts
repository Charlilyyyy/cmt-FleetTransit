import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const checkInSchema = z.object({
  passengerId: z.string().uuid(),
  routeStopId: z.string().uuid().optional(),
  type: z.enum(['pickup', 'dropoff']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  otp: z.string().min(4).max(64).optional(),
  photoDataUrl: z.string().optional(),
  clientEventId: z.string().uuid().optional(),
  recordedAt: z.string().datetime({ offset: true }).optional(),
});

type Params = { params: { id: string } };

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new ApiError('Invalid photo payload', 400, 'BAD_PHOTO');
  return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

/** Driver check-in/out with OTP verification, optional photo proof, and GPS tag. */
export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('checkIns', 'create');
    const storage = getServerStorage();

    const trip = await storage.trips.get(params.id);
    if (!trip || !canAccessOrganization(session.role, session.organizationId, trip.organizationId)) {
      throw new ApiError('Trip not found', 404, 'NOT_FOUND');
    }

    const body = await parseBody(request, checkInSchema);
    const passenger = await storage.passengers.get(body.passengerId);
    if (!passenger || passenger.organizationId !== trip.organizationId) {
      throw new ApiError('Passenger not found', 404, 'NOT_FOUND');
    }

    // OTP proves the correct passenger boarded (guardian shares the code).
    if (body.otp && passenger.otpSecret && body.otp !== passenger.otpSecret) {
      throw new ApiError('OTP does not match', 401, 'BAD_OTP');
    }

    const org = await storage.organizations.get(trip.organizationId);
    let photoStoragePath: string | undefined;
    if (body.photoDataUrl) {
      const { buffer, contentType } = dataUrlToBuffer(body.photoDataUrl);
      const path = `${trip.organizationId}/${trip.id}/${crypto.randomUUID()}`;
      photoStoragePath = await storage.files.uploadCheckInPhoto(path, buffer, contentType);
    } else if (org?.photoProofRequired) {
      throw new ApiError('Photo proof is required by this organization', 400, 'PHOTO_REQUIRED');
    }

    const checkIn = await storage.checkIns.create({
      organizationId: trip.organizationId,
      tripId: trip.id,
      passengerId: body.passengerId,
      routeStopId: body.routeStopId ?? null,
      driverUserId: session.userId,
      type: body.type,
      lat: body.lat,
      lng: body.lng,
      photoStoragePath: photoStoragePath ?? null,
      clientEventId: body.clientEventId ?? null,
    });

    await writeAudit(storage, session, {
      action: `checkin.${body.type}`,
      entityType: 'check_in',
      entityId: checkIn.id,
      organizationId: trip.organizationId,
      metadata: { passengerId: body.passengerId, tripId: trip.id },
    });

    return NextResponse.json({ data: checkIn }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
