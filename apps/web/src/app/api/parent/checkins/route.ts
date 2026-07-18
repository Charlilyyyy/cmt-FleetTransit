import { NextResponse } from 'next/server';

import { ApiError, getServerStorage, handleApiError, rateLimit, requireSession } from '@/lib/api';

/**
 * Pickup/dropoff events for one of the guardian's children.
 * Verifies the guardian link before returning any check-in data.
 */
export async function GET(request: Request) {
  try {
    rateLimit(request, 60);
    const session = await requireSession();
    const passengerId = new URL(request.url).searchParams.get('passengerId');
    if (!passengerId) {
      throw new ApiError('passengerId required', 400, 'BAD_REQUEST');
    }

    const storage = getServerStorage();
    const links = await storage.passengerGuardians.listByGuardian(session.userId);
    const linked = links.some((l) => l.passengerId === passengerId);
    if (!linked && session.role !== 'admin' && session.role !== 'superadmin') {
      throw new ApiError('Not your passenger', 403, 'FORBIDDEN');
    }

    const checkIns = await storage.checkIns.listByPassenger(passengerId);
    return NextResponse.json({ data: checkIns });
  } catch (error) {
    return handleApiError(error);
  }
}
