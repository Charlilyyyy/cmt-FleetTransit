import { z } from 'zod';

export const userRoleSchema = z.enum(['superadmin', 'admin', 'staff', 'driver', 'parent']);

export const orgStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export const entityStatusSchema = z.enum(['active', 'inactive']);

export const routeDirectionSchema = z.enum(['pickup', 'dropoff']);

export const tripStatusSchema = z.enum(['scheduled', 'active', 'completed', 'cancelled']);

export const checkInTypeSchema = z.enum(['pickup', 'dropoff']);

export const notificationChannelSchema = z.enum(['fcm', 'line', 'telegram']);

export const notificationStatusSchema = z.enum(['pending', 'sent', 'failed']);

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: orgStatusSchema,
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  photoProofRequired: z.boolean(),
  notificationConfig: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().nullable().optional(),
  firebaseUid: z.string().min(1),
  role: userRoleSchema,
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  lineUserId: z.string().nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  status: entityStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const schoolSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  status: entityStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vehicleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  label: z.string().min(1),
  licensePlate: z.string().min(1),
  seatCapacity: z.number().int().positive(),
  vehicleType: z.string().nullable().optional(),
  status: entityStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const driverSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseNumber: z.string().nullable().optional(),
  licenseExpiry: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  status: entityStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const passengerSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.string().nullable().optional(),
  defaultStopLat: z.number().nullable().optional(),
  defaultStopLng: z.number().nullable().optional(),
  defaultStopAddress: z.string().nullable().optional(),
  otpSecret: z.string().min(1),
  status: entityStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tripSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  routeId: z.string().uuid(),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  scheduledDate: z.string(),
  scheduledStartAt: z.string().nullable().optional(),
  actualStartAt: z.string().nullable().optional(),
  actualEndAt: z.string().nullable().optional(),
  status: tripStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
