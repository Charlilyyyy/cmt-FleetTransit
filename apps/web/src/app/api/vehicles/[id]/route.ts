import { canAccessOrganization } from '@cmt/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { writeAudit } from '@/lib/audit';
import { ApiError, getServerStorage, handleApiError, parseBody, requirePermission } from '@/lib/api';

const updateVehicleSchema = z
  .object({
    label: z.string().min(1).max(100),
    licensePlate: z.string().min(1).max(50),
    seatCapacity: z.number().int().min(1).max(100),
    vehicleType: z.enum(['bus', 'van', 'car']),
    status: z.enum(['active', 'inactive']),
  })
  .partial();

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('vehicles', 'read');
    const storage = getServerStorage();
    const vehicle = await storage.vehicles.get(params.id);
    if (!vehicle || !canAccessOrganization(session.role, session.organizationId, vehicle.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ data: vehicle });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('vehicles', 'update');
    const storage = getServerStorage();
    const existing = await storage.vehicles.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    const body = await parseBody(request, updateVehicleSchema);
    const updated = await storage.vehicles.update(params.id, body);

    await writeAudit(storage, session, {
      action: 'vehicle.update',
      entityType: 'vehicle',
      entityId: params.id,
      organizationId: existing.organizationId,
      metadata: { changed: Object.keys(body) },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requirePermission('vehicles', 'delete');
    const storage = getServerStorage();
    const existing = await storage.vehicles.get(params.id);
    if (!existing || !canAccessOrganization(session.role, session.organizationId, existing.organizationId)) {
      throw new ApiError('Not found', 404, 'NOT_FOUND');
    }
    await storage.vehicles.update(params.id, { status: 'inactive' });

    await writeAudit(storage, session, {
      action: 'vehicle.delete',
      entityType: 'vehicle',
      entityId: params.id,
      organizationId: existing.organizationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
