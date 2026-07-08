export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  STAFF: 'staff',
  DRIVER: 'driver',
  PARENT: 'parent',
} as const;

export const ORG_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const ENTITY_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const ROUTE_DIRECTIONS = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
} as const;

export const TRIP_STATUSES = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CHECK_IN_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
} as const;

export const NOTIFICATION_CHANNELS = {
  FCM: 'fcm',
  LINE: 'line',
  TELEGRAM: 'telegram',
} as const;

export const NOTIFICATION_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export const VEHICLE_TYPES = {
  BUS: 'bus',
  VAN: 'van',
  CAR: 'car',
} as const;

export const DEFAULT_SEAT_CAPACITY = {
  bus: 40,
  van: 12,
  car: 4,
} as const;

export const NOTIFICATION_EVENT_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  DELAY: 'delay',
  EMERGENCY: 'emergency',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
} as const;
