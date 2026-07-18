import { NextResponse } from 'next/server';

import { getServerStorage, handleApiError, rateLimit, requireSession } from '@/lib/api';

/** Passengers linked to the signed-in guardian. Parent-scoped only. */
export async function GET(request: Request) {
  try {
    rateLimit(request, 60);
    const session = await requireSession();
    const storage = getServerStorage();

    const links = await storage.passengerGuardians.listByGuardian(session.userId);
    const passengers = await Promise.all(links.map((link) => storage.passengers.get(link.passengerId)));

    return NextResponse.json({
      data: passengers.filter((p): p is NonNullable<typeof p> => p !== null),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
