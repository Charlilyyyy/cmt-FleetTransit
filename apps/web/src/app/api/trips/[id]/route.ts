import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';

import { ApiError, getServerStorage, handleApiError, requirePermission } from '@/lib/api';

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('trips', 'read');
    const storage = getServerStorage();
    const trip = await storage.trips.get(params.id);
    if (!trip || !canAccessOrganization(session.role, session.organizationId, trip.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: trip });
  } catch (error) {
    return handleApiError(error);
  }
}
