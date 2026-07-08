export type UserRole = 'superadmin' | 'admin' | 'staff' | 'driver' | 'parent';

export type OrgStatus = 'active' | 'inactive' | 'suspended';

export type EntityStatus = 'active' | 'inactive';

export type RouteDirection = 'pickup' | 'dropoff';

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type CheckInType = 'pickup' | 'dropoff';

export type NotificationChannel = 'fcm' | 'line' | 'telegram';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
  photoProofRequired: boolean;
  lineChannelAccessToken?: string | null;
  lineChannelSecret?: string | null;
  telegramBotToken?: string | null;
  notificationConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId?: string | null;
  firebaseUid: string;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
  lineUserId?: string | null;
  firstName: string;
  lastName: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  organizationId: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  label: string;
  licensePlate: string;
  seatCapacity: number;
  vehicleType?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  organizationId: string;
  userId: string;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  emergencyContact?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Passenger {
  id: string;
  organizationId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  grade?: string | null;
  defaultStopLat?: number | null;
  defaultStopLng?: number | null;
  defaultStopAddress?: string | null;
  otpSecret: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PassengerGuardian {
  id: string;
  organizationId: string;
  passengerId: string;
  guardianUserId: string;
  relationship?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface GuardianDevice {
  id: string;
  organizationId: string;
  userId: string;
  channel: NotificationChannel;
  fcmToken?: string | null;
  lineUserId?: string | null;
  telegramChatId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  organizationId: string;
  schoolId?: string | null;
  vehicleId?: string | null;
  name: string;
  direction: RouteDirection;
  totalDistanceM: number;
  estimatedDurationS: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  id: string;
  organizationId: string;
  routeId: string;
  sequence: number;
  passengerId?: string | null;
  lat: number;
  lng: number;
  addressLabel: string;
  estimatedArrivalOffsetS?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  organizationId: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  scheduledDate: string;
  scheduledStartAt?: string | null;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  organizationId: string;
  tripId: string;
  passengerId: string;
  routeStopId?: string | null;
  driverUserId: string;
  type: CheckInType;
  lat: number;
  lng: number;
  photoStoragePath?: string | null;
  clientEventId?: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface LocationSample {
  id: string;
  organizationId: string;
  tripId: string;
  driverId?: string | null;
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  recordedAt: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  recipientUserId: string;
  tripId?: string | null;
  passengerId?: string | null;
  checkInId?: string | null;
  channel: NotificationChannel;
  type: string;
  title: string;
  body: string;
  status: NotificationStatus;
  providerMessageId?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
}
