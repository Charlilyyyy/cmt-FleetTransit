import type {
  AuditLog,
  CheckIn,
  Driver,
  LocationSample,
  Notification,
  Organization,
  Passenger,
  PassengerGuardian,
  Route,
  RouteStop,
  School,
  Trip,
  User,
  Vehicle,
} from '@cmt/shared';

type Row = Record<string, unknown>;

export function mapOrganization(row: Row): Organization {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    status: row.status as Organization['status'],
    contactEmail: (row.contact_email as string | null) ?? null,
    contactPhone: (row.contact_phone as string | null) ?? null,
    photoProofRequired: Boolean(row.photo_proof_required),
    lineChannelAccessToken: (row.line_channel_access_token as string | null) ?? null,
    lineChannelSecret: (row.line_channel_secret as string | null) ?? null,
    telegramBotToken: (row.telegram_bot_token as string | null) ?? null,
    notificationConfig: (row.notification_config as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapUser(row: Row): User {
  return {
    id: String(row.id),
    organizationId: (row.organization_id as string | null) ?? null,
    firebaseUid: String(row.firebase_uid),
    role: row.role as User['role'],
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    lineUserId: (row.line_user_id as string | null) ?? null,
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    status: row.status as User['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapSchool(row: Row): School {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    name: String(row.name),
    address: (row.address as string | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    contactName: (row.contact_name as string | null) ?? null,
    contactPhone: (row.contact_phone as string | null) ?? null,
    status: row.status as School['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapVehicle(row: Row): Vehicle {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    label: String(row.label),
    licensePlate: String(row.license_plate),
    seatCapacity: Number(row.seat_capacity),
    vehicleType: (row.vehicle_type as string | null) ?? null,
    status: row.status as Vehicle['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapDriver(row: Row): Driver {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    userId: String(row.user_id),
    licenseNumber: (row.license_number as string | null) ?? null,
    licenseExpiry: (row.license_expiry as string | null) ?? null,
    emergencyContact: (row.emergency_contact as string | null) ?? null,
    status: row.status as Driver['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapPassenger(row: Row): Passenger {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    schoolId: String(row.school_id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    grade: (row.grade as string | null) ?? null,
    defaultStopLat: (row.default_stop_lat as number | null) ?? null,
    defaultStopLng: (row.default_stop_lng as number | null) ?? null,
    defaultStopAddress: (row.default_stop_address as string | null) ?? null,
    otpSecret: String(row.otp_secret),
    status: row.status as Passenger['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapPassengerGuardian(row: Row): PassengerGuardian {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    passengerId: String(row.passenger_id),
    guardianUserId: String(row.guardian_user_id),
    relationship: (row.relationship as string | null) ?? null,
    isPrimary: Boolean(row.is_primary),
    createdAt: String(row.created_at),
  };
}

export function mapRoute(row: Row): Route {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    schoolId: (row.school_id as string | null) ?? null,
    vehicleId: (row.vehicle_id as string | null) ?? null,
    name: String(row.name),
    direction: row.direction as Route['direction'],
    totalDistanceM: Number(row.total_distance_m ?? 0),
    estimatedDurationS: Number(row.estimated_duration_s ?? 0),
    isActive: row.is_active !== false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRouteStop(row: Row): RouteStop {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    routeId: String(row.route_id),
    sequence: Number(row.sequence),
    passengerId: (row.passenger_id as string | null) ?? null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    addressLabel: String(row.address_label),
    estimatedArrivalOffsetS: (row.estimated_arrival_offset_s as number | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapTrip(row: Row): Trip {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    routeId: String(row.route_id),
    driverId: String(row.driver_id),
    vehicleId: String(row.vehicle_id),
    scheduledDate: String(row.scheduled_date),
    scheduledStartAt: (row.scheduled_start_at as string | null) ?? null,
    actualStartAt: (row.actual_start_at as string | null) ?? null,
    actualEndAt: (row.actual_end_at as string | null) ?? null,
    status: row.status as Trip['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapCheckIn(row: Row): CheckIn {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    tripId: String(row.trip_id),
    passengerId: String(row.passenger_id),
    routeStopId: (row.route_stop_id as string | null) ?? null,
    driverUserId: String(row.driver_user_id),
    type: row.type as CheckIn['type'],
    lat: Number(row.lat),
    lng: Number(row.lng),
    photoStoragePath: (row.photo_storage_path as string | null) ?? null,
    clientEventId: (row.client_event_id as string | null) ?? null,
    recordedAt: String(row.recorded_at),
    createdAt: String(row.created_at),
  };
}

export function mapLocationSample(row: Row): LocationSample {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    tripId: String(row.trip_id),
    driverId: (row.driver_id as string | null) ?? null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    heading: (row.heading as number | null) ?? null,
    speed: (row.speed as number | null) ?? null,
    accuracy: (row.accuracy as number | null) ?? null,
    recordedAt: String(row.recorded_at),
  };
}

export function mapNotification(row: Row): Notification {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    recipientUserId: String(row.recipient_user_id),
    tripId: (row.trip_id as string | null) ?? null,
    passengerId: (row.passenger_id as string | null) ?? null,
    checkInId: (row.check_in_id as string | null) ?? null,
    channel: row.channel as Notification['channel'],
    type: String(row.type),
    title: String(row.title),
    body: String(row.body),
    status: row.status as Notification['status'],
    providerMessageId: (row.provider_message_id as string | null) ?? null,
    sentAt: (row.sent_at as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapAuditLog(row: Row): AuditLog {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    actorUserId: (row.actor_user_id as string | null) ?? null,
    action: String(row.action),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
  };
}
