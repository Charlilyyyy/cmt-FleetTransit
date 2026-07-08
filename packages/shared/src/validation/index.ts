import { z } from 'zod';

import { checkInTypeSchema, notificationChannelSchema, routeDirectionSchema, userRoleSchema } from '../schemas';

const e164Phone = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be E.164 (e.g. +15551234567)');

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  contactEmail: z.string().email().optional(),
  contactPhone: e164Phone.optional(),
  photoProofRequired: z.boolean().default(false),
});

export const createUserSchema = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  firebaseUid: z.string().min(1).max(128),
  role: userRoleSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: e164Phone.optional(),
});

export const createSchoolSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  address: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: e164Phone.optional(),
});

export const createVehicleSchema = z.object({
  organizationId: z.string().uuid(),
  label: z.string().min(1).max(100),
  licensePlate: z.string().min(1).max(50),
  seatCapacity: z.number().int().min(1).max(100),
  vehicleType: z.enum(['bus', 'van', 'car']).optional(),
});

export const createDriverSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseNumber: z.string().max(50).optional(),
  licenseExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
    .optional(),
  emergencyContact: e164Phone.optional(),
});

export const createPassengerSchema = z.object({
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  grade: z.string().max(50).optional(),
  defaultStopLat: z.number().min(-90).max(90).optional(),
  defaultStopLng: z.number().min(-180).max(180).optional(),
  defaultStopAddress: z.string().max(500).optional(),
  otpSecret: z.string().min(4).max(64),
});

export const linkGuardianSchema = z.object({
  organizationId: z.string().uuid(),
  passengerId: z.string().uuid(),
  guardianUserId: z.string().uuid(),
  relationship: z.string().max(50).optional(),
  isPrimary: z.boolean().default(false),
});

export const createRouteSchema = z.object({
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  direction: routeDirectionSchema,
});

export const createRouteStopSchema = z.object({
  organizationId: z.string().uuid(),
  routeId: z.string().uuid(),
  sequence: z.number().int().min(1),
  passengerId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  addressLabel: z.string().min(1).max(255),
  estimatedArrivalOffsetS: z.number().int().min(0).optional(),
});

export const createTripSchema = z.object({
  organizationId: z.string().uuid(),
  routeId: z.string().uuid(),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  scheduledStartAt: z.string().datetime({ offset: true }).optional(),
});

export const createCheckInSchema = z.object({
  organizationId: z.string().uuid(),
  tripId: z.string().uuid(),
  passengerId: z.string().uuid(),
  routeStopId: z.string().uuid().optional(),
  driverUserId: z.string().uuid(),
  type: checkInTypeSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photoStoragePath: z.string().optional(),
  clientEventId: z.string().uuid().optional(),
  recordedAt: z.string().datetime({ offset: true }).optional(),
});

export const registerDeviceSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  channel: notificationChannelSchema,
  fcmToken: z.string().optional(),
  lineUserId: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export const inputSchemas = {
  createOrganization: createOrganizationSchema,
  createUser: createUserSchema,
  createSchool: createSchoolSchema,
  createVehicle: createVehicleSchema,
  createDriver: createDriverSchema,
  createPassenger: createPassengerSchema,
  linkGuardian: linkGuardianSchema,
  createRoute: createRouteSchema,
  createRouteStop: createRouteStopSchema,
  createTrip: createTripSchema,
  createCheckIn: createCheckInSchema,
  registerDevice: registerDeviceSchema,
} as const;
