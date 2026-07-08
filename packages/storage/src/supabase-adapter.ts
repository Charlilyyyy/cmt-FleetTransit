import type { SupabaseClient } from '@supabase/supabase-js';
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

import type { StorageAdapter, TripListFilters } from './adapter';
import {
  mapAuditLog,
  mapCheckIn,
  mapDriver,
  mapLocationSample,
  mapNotification,
  mapOrganization,
  mapPassenger,
  mapPassengerGuardian,
  mapRoute,
  mapRouteStop,
  mapSchool,
  mapTrip,
  mapUser,
  mapVehicle,
} from './mappers';

const CHECK_IN_PHOTOS_BUCKET = 'check-in-photos';

function throwOnError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export class SupabaseAdapter implements StorageAdapter {
  constructor(private readonly client: SupabaseClient) {}

  organizations: StorageAdapter['organizations'] = {
    list: async (): Promise<Organization[]> => {
      const { data, error } = await this.client.from('organizations').select('*');
      throwOnError(error);
      return (data ?? []).map(mapOrganization);
    },

    get: async (id: string): Promise<Organization | null> => {
      const { data, error } = await this.client.from('organizations').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapOrganization(data) : null;
    },

    getBySlug: async (slug: string): Promise<Organization | null> => {
      const { data, error } = await this.client.from('organizations').select('*').eq('slug', slug).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapOrganization(data) : null;
    },

    create: async (input): Promise<Organization> => {
      const { data, error } = await this.client
        .from('organizations')
        .insert({
          name: input.name,
          slug: input.slug,
          status: input.status ?? 'active',
          contact_email: input.contactEmail,
          contact_phone: input.contactPhone,
          photo_proof_required: input.photoProofRequired,
          notification_config: input.notificationConfig ?? {},
        })
        .select()
        .single();
      throwOnError(error);
      return mapOrganization(data!);
    },

    update: async (id, input): Promise<Organization> => {
      const { data, error } = await this.client
        .from('organizations')
        .update({
          name: input.name,
          slug: input.slug,
          status: input.status,
          contact_email: input.contactEmail,
          contact_phone: input.contactPhone,
          photo_proof_required: input.photoProofRequired,
          notification_config: input.notificationConfig,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapOrganization(data!);
    },
  };

  users: StorageAdapter['users'] = {
    list: async (organizationId: string): Promise<User[]> => {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapUser);
    },

    get: async (id: string): Promise<User | null> => {
      const { data, error } = await this.client.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapUser(data) : null;
    },

    getByFirebaseUid: async (firebaseUid: string): Promise<User | null> => {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapUser(data) : null;
    },

    create: async (input): Promise<User> => {
      const { data, error } = await this.client
        .from('users')
        .insert({
          organization_id: input.organizationId,
          firebase_uid: input.firebaseUid,
          role: input.role,
          email: input.email,
          phone: input.phone,
          line_user_id: input.lineUserId,
          first_name: input.firstName,
          last_name: input.lastName,
          status: input.status ?? 'active',
        })
        .select()
        .single();
      throwOnError(error);
      return mapUser(data!);
    },

    update: async (id, input): Promise<User> => {
      const { data, error } = await this.client
        .from('users')
        .update({
          organization_id: input.organizationId,
          role: input.role,
          email: input.email,
          phone: input.phone,
          line_user_id: input.lineUserId,
          first_name: input.firstName,
          last_name: input.lastName,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapUser(data!);
    },
  };

  schools: StorageAdapter['schools'] = {
    list: async (organizationId: string): Promise<School[]> => {
      const { data, error } = await this.client
        .from('schools')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapSchool);
    },

    get: async (id: string): Promise<School | null> => {
      const { data, error } = await this.client.from('schools').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapSchool(data) : null;
    },

    create: async (input): Promise<School> => {
      const { data, error } = await this.client
        .from('schools')
        .insert({
          organization_id: input.organizationId,
          name: input.name,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          status: input.status ?? 'active',
        })
        .select()
        .single();
      throwOnError(error);
      return mapSchool(data!);
    },

    update: async (id, input): Promise<School> => {
      const { data, error } = await this.client
        .from('schools')
        .update({
          name: input.name,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapSchool(data!);
    },
  };

  vehicles: StorageAdapter['vehicles'] = {
    list: async (organizationId: string): Promise<Vehicle[]> => {
      const { data, error } = await this.client
        .from('vehicles')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapVehicle);
    },

    get: async (id: string): Promise<Vehicle | null> => {
      const { data, error } = await this.client.from('vehicles').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapVehicle(data) : null;
    },

    create: async (input): Promise<Vehicle> => {
      const { data, error } = await this.client
        .from('vehicles')
        .insert({
          organization_id: input.organizationId,
          label: input.label,
          license_plate: input.licensePlate,
          seat_capacity: input.seatCapacity,
          vehicle_type: input.vehicleType,
          status: input.status ?? 'active',
        })
        .select()
        .single();
      throwOnError(error);
      return mapVehicle(data!);
    },

    update: async (id, input): Promise<Vehicle> => {
      const { data, error } = await this.client
        .from('vehicles')
        .update({
          label: input.label,
          license_plate: input.licensePlate,
          seat_capacity: input.seatCapacity,
          vehicle_type: input.vehicleType,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapVehicle(data!);
    },
  };

  drivers: StorageAdapter['drivers'] = {
    list: async (organizationId: string): Promise<Driver[]> => {
      const { data, error } = await this.client
        .from('drivers')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapDriver);
    },

    get: async (id: string): Promise<Driver | null> => {
      const { data, error } = await this.client.from('drivers').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapDriver(data) : null;
    },

    getByUserId: async (userId: string): Promise<Driver | null> => {
      const { data, error } = await this.client
        .from('drivers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapDriver(data) : null;
    },

    create: async (input): Promise<Driver> => {
      const { data, error } = await this.client
        .from('drivers')
        .insert({
          organization_id: input.organizationId,
          user_id: input.userId,
          license_number: input.licenseNumber,
          license_expiry: input.licenseExpiry,
          emergency_contact: input.emergencyContact,
          status: input.status ?? 'active',
        })
        .select()
        .single();
      throwOnError(error);
      return mapDriver(data!);
    },

    update: async (id, input): Promise<Driver> => {
      const { data, error } = await this.client
        .from('drivers')
        .update({
          license_number: input.licenseNumber,
          license_expiry: input.licenseExpiry,
          emergency_contact: input.emergencyContact,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapDriver(data!);
    },
  };

  passengers: StorageAdapter['passengers'] = {
    list: async (organizationId: string): Promise<Passenger[]> => {
      const { data, error } = await this.client
        .from('passengers')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapPassenger);
    },

    get: async (id: string): Promise<Passenger | null> => {
      const { data, error } = await this.client.from('passengers').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapPassenger(data) : null;
    },

    create: async (input): Promise<Passenger> => {
      const { data, error } = await this.client
        .from('passengers')
        .insert({
          organization_id: input.organizationId,
          school_id: input.schoolId,
          first_name: input.firstName,
          last_name: input.lastName,
          grade: input.grade,
          default_stop_lat: input.defaultStopLat,
          default_stop_lng: input.defaultStopLng,
          default_stop_address: input.defaultStopAddress,
          otp_secret: input.otpSecret,
          status: input.status ?? 'active',
        })
        .select()
        .single();
      throwOnError(error);
      return mapPassenger(data!);
    },

    update: async (id, input): Promise<Passenger> => {
      const { data, error } = await this.client
        .from('passengers')
        .update({
          school_id: input.schoolId,
          first_name: input.firstName,
          last_name: input.lastName,
          grade: input.grade,
          default_stop_lat: input.defaultStopLat,
          default_stop_lng: input.defaultStopLng,
          default_stop_address: input.defaultStopAddress,
          otp_secret: input.otpSecret,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapPassenger(data!);
    },
  };

  passengerGuardians: StorageAdapter['passengerGuardians'] = {
    listByPassenger: async (passengerId: string): Promise<PassengerGuardian[]> => {
      const { data, error } = await this.client
        .from('passenger_guardians')
        .select('*')
        .eq('passenger_id', passengerId);
      throwOnError(error);
      return (data ?? []).map(mapPassengerGuardian);
    },

    listByGuardian: async (guardianUserId: string): Promise<PassengerGuardian[]> => {
      const { data, error } = await this.client
        .from('passenger_guardians')
        .select('*')
        .eq('guardian_user_id', guardianUserId);
      throwOnError(error);
      return (data ?? []).map(mapPassengerGuardian);
    },

    link: async (input): Promise<PassengerGuardian> => {
      const { data, error } = await this.client
        .from('passenger_guardians')
        .insert({
          organization_id: input.organizationId,
          passenger_id: input.passengerId,
          guardian_user_id: input.guardianUserId,
          relationship: input.relationship,
          is_primary: input.isPrimary ?? false,
        })
        .select()
        .single();
      throwOnError(error);
      return mapPassengerGuardian(data!);
    },
  };

  routes: StorageAdapter['routes'] = {
    list: async (organizationId: string): Promise<Route[]> => {
      const { data, error } = await this.client
        .from('routes')
        .select('*')
        .eq('organization_id', organizationId);
      throwOnError(error);
      return (data ?? []).map(mapRoute);
    },

    get: async (id: string): Promise<Route | null> => {
      const { data, error } = await this.client.from('routes').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapRoute(data) : null;
    },

    create: async (input): Promise<Route> => {
      const { data, error } = await this.client
        .from('routes')
        .insert({
          organization_id: input.organizationId,
          school_id: input.schoolId,
          vehicle_id: input.vehicleId,
          name: input.name,
          direction: input.direction,
          total_distance_m: input.totalDistanceM ?? 0,
          estimated_duration_s: input.estimatedDurationS ?? 0,
          is_active: input.isActive ?? true,
        })
        .select()
        .single();
      throwOnError(error);
      return mapRoute(data!);
    },

    update: async (id, input): Promise<Route> => {
      const { data, error } = await this.client
        .from('routes')
        .update({
          school_id: input.schoolId,
          vehicle_id: input.vehicleId,
          name: input.name,
          direction: input.direction,
          total_distance_m: input.totalDistanceM,
          estimated_duration_s: input.estimatedDurationS,
          is_active: input.isActive,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapRoute(data!);
    },
  };

  routeStops: StorageAdapter['routeStops'] = {
    list: async (routeId: string): Promise<RouteStop[]> => {
      const { data, error } = await this.client
        .from('route_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('sequence');
      throwOnError(error);
      return (data ?? []).map(mapRouteStop);
    },

    create: async (input): Promise<RouteStop> => {
      const { data, error } = await this.client
        .from('route_stops')
        .insert({
          organization_id: input.organizationId,
          route_id: input.routeId,
          sequence: input.sequence,
          passenger_id: input.passengerId,
          lat: input.lat,
          lng: input.lng,
          address_label: input.addressLabel,
          estimated_arrival_offset_s: input.estimatedArrivalOffsetS,
        })
        .select()
        .single();
      throwOnError(error);
      return mapRouteStop(data!);
    },

    update: async (id, input): Promise<RouteStop> => {
      const { data, error } = await this.client
        .from('route_stops')
        .update({
          sequence: input.sequence,
          passenger_id: input.passengerId,
          lat: input.lat,
          lng: input.lng,
          address_label: input.addressLabel,
          estimated_arrival_offset_s: input.estimatedArrivalOffsetS,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapRouteStop(data!);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.client.from('route_stops').delete().eq('id', id);
      throwOnError(error);
    },
  };

  trips: StorageAdapter['trips'] = {
    list: async (organizationId: string, filters?: TripListFilters): Promise<Trip[]> => {
      let query = this.client.from('trips').select('*').eq('organization_id', organizationId);
      if (filters?.scheduledDate) {
        query = query.eq('scheduled_date', filters.scheduledDate);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      const { data, error } = await query;
      throwOnError(error);
      return (data ?? []).map(mapTrip);
    },

    get: async (id: string): Promise<Trip | null> => {
      const { data, error } = await this.client.from('trips').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapTrip(data) : null;
    },

    create: async (input): Promise<Trip> => {
      const { data, error } = await this.client
        .from('trips')
        .insert({
          organization_id: input.organizationId,
          route_id: input.routeId,
          driver_id: input.driverId,
          vehicle_id: input.vehicleId,
          scheduled_date: input.scheduledDate,
          scheduled_start_at: input.scheduledStartAt,
          actual_start_at: input.actualStartAt,
          actual_end_at: input.actualEndAt,
          status: input.status ?? 'scheduled',
        })
        .select()
        .single();
      throwOnError(error);
      return mapTrip(data!);
    },

    update: async (id, input): Promise<Trip> => {
      const { data, error } = await this.client
        .from('trips')
        .update({
          route_id: input.routeId,
          driver_id: input.driverId,
          vehicle_id: input.vehicleId,
          scheduled_date: input.scheduledDate,
          scheduled_start_at: input.scheduledStartAt,
          actual_start_at: input.actualStartAt,
          actual_end_at: input.actualEndAt,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single();
      throwOnError(error);
      return mapTrip(data!);
    },
  };

  checkIns: StorageAdapter['checkIns'] = {
    list: async (tripId: string): Promise<CheckIn[]> => {
      const { data, error } = await this.client
        .from('check_ins')
        .select('*')
        .eq('trip_id', tripId)
        .order('recorded_at');
      throwOnError(error);
      return (data ?? []).map(mapCheckIn);
    },

    create: async (input): Promise<CheckIn> => {
      const { data, error } = await this.client
        .from('check_ins')
        .insert({
          organization_id: input.organizationId,
          trip_id: input.tripId,
          passenger_id: input.passengerId,
          route_stop_id: input.routeStopId,
          driver_user_id: input.driverUserId,
          type: input.type,
          lat: input.lat,
          lng: input.lng,
          photo_storage_path: input.photoStoragePath,
          client_event_id: input.clientEventId,
          recorded_at: input.recordedAt,
        })
        .select()
        .single();
      throwOnError(error);
      return mapCheckIn(data!);
    },
  };

  locations: StorageAdapter['locations'] = {
    list: async (tripId: string): Promise<LocationSample[]> => {
      const { data, error } = await this.client
        .from('locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('recorded_at');
      throwOnError(error);
      return (data ?? []).map(mapLocationSample);
    },

    append: async (input): Promise<LocationSample> => {
      const { data, error } = await this.client
        .from('locations')
        .insert({
          organization_id: input.organizationId,
          trip_id: input.tripId,
          driver_id: input.driverId,
          lat: input.lat,
          lng: input.lng,
          heading: input.heading,
          speed: input.speed,
          accuracy: input.accuracy,
          recorded_at: input.recordedAt,
        })
        .select()
        .single();
      throwOnError(error);
      return mapLocationSample(data!);
    },
  };

  notifications: StorageAdapter['notifications'] = {
    listByRecipient: async (recipientUserId: string): Promise<Notification[]> => {
      const { data, error } = await this.client
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', recipientUserId)
        .order('created_at', { ascending: false })
        .limit(50);
      throwOnError(error);
      return (data ?? []).map(mapNotification);
    },

    create: async (input): Promise<Notification> => {
      const { data, error } = await this.client
        .from('notifications')
        .insert({
          organization_id: input.organizationId,
          recipient_user_id: input.recipientUserId,
          trip_id: input.tripId,
          passenger_id: input.passengerId,
          check_in_id: input.checkInId,
          channel: input.channel,
          type: input.type,
          title: input.title,
          body: input.body,
          status: input.status ?? 'pending',
        })
        .select()
        .single();
      throwOnError(error);
      return mapNotification(data!);
    },

    markSent: async (id: string, providerMessageId?: string): Promise<void> => {
      const { error } = await this.client
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: providerMessageId,
        })
        .eq('id', id);
      throwOnError(error);
    },

    markFailed: async (id: string, errorMessage: string): Promise<void> => {
      const { error } = await this.client
        .from('notifications')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', id);
      throwOnError(error);
    },
  };

  auditLogs: StorageAdapter['auditLogs'] = {
    list: async (organizationId: string): Promise<AuditLog[]> => {
      const { data, error } = await this.client
        .from('audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);
      throwOnError(error);
      return (data ?? []).map(mapAuditLog);
    },

    create: async (input): Promise<AuditLog> => {
      const { data, error } = await this.client
        .from('audit_logs')
        .insert({
          organization_id: input.organizationId,
          actor_user_id: input.actorUserId,
          action: input.action,
          entity_type: input.entityType,
          entity_id: input.entityId,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();
      throwOnError(error);
      return mapAuditLog(data!);
    },
  };

  files: StorageAdapter['files'] = {
    uploadCheckInPhoto: async (
      path: string,
      body: Blob | ArrayBuffer | Buffer,
      contentType = 'image/jpeg'
    ): Promise<string> => {
      const { data, error } = await this.client.storage.from(CHECK_IN_PHOTOS_BUCKET).upload(path, body, {
        contentType,
        upsert: false,
      });
      throwOnError(error);
      return data!.path;
    },

    getSignedUrl: async (path: string, expiresInSeconds = 3600): Promise<string> => {
      const { data, error } = await this.client.storage
        .from(CHECK_IN_PHOTOS_BUCKET)
        .createSignedUrl(path, expiresInSeconds);
      throwOnError(error);
      return data!.signedUrl;
    },
  };
}
