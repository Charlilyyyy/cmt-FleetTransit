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

export type TripListFilters = {
  scheduledDate?: string;
  status?: string;
};

export interface StorageAdapter {
  organizations: {
    list(): Promise<Organization[]>;
    get(id: string): Promise<Organization | null>;
    getBySlug(slug: string): Promise<Organization | null>;
    create(
      data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'notificationConfig'> &
        Partial<Pick<Organization, 'status' | 'notificationConfig'>>
    ): Promise<Organization>;
    update(id: string, data: Partial<Organization>): Promise<Organization>;
  };

  users: {
    list(organizationId: string): Promise<User[]>;
    get(id: string): Promise<User | null>;
    getByFirebaseUid(firebaseUid: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<User, 'status'>>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
  };

  schools: {
    list(organizationId: string): Promise<School[]>;
    get(id: string): Promise<School | null>;
    create(
      data: Omit<School, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<School, 'status'>>
    ): Promise<School>;
    update(id: string, data: Partial<School>): Promise<School>;
  };

  vehicles: {
    list(organizationId: string): Promise<Vehicle[]>;
    get(id: string): Promise<Vehicle | null>;
    create(
      data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Vehicle, 'status'>>
    ): Promise<Vehicle>;
    update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  };

  drivers: {
    list(organizationId: string): Promise<Driver[]>;
    get(id: string): Promise<Driver | null>;
    getByUserId(userId: string): Promise<Driver | null>;
    create(
      data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Driver, 'status'>>
    ): Promise<Driver>;
    update(id: string, data: Partial<Driver>): Promise<Driver>;
  };

  passengers: {
    list(organizationId: string): Promise<Passenger[]>;
    get(id: string): Promise<Passenger | null>;
    create(
      data: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Passenger, 'status'>>
    ): Promise<Passenger>;
    update(id: string, data: Partial<Passenger>): Promise<Passenger>;
  };

  passengerGuardians: {
    listByPassenger(passengerId: string): Promise<PassengerGuardian[]>;
    listByGuardian(guardianUserId: string): Promise<PassengerGuardian[]>;
    link(
      data: Omit<PassengerGuardian, 'id' | 'createdAt' | 'isPrimary'> & Partial<Pick<PassengerGuardian, 'isPrimary'>>
    ): Promise<PassengerGuardian>;
  };

  routes: {
    list(organizationId: string): Promise<Route[]>;
    get(id: string): Promise<Route | null>;
    create(
      data: Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'totalDistanceM' | 'estimatedDurationS' | 'isActive'> &
        Partial<Pick<Route, 'totalDistanceM' | 'estimatedDurationS' | 'isActive'>>
    ): Promise<Route>;
    update(id: string, data: Partial<Route>): Promise<Route>;
  };

  routeStops: {
    list(routeId: string): Promise<RouteStop[]>;
    create(data: Omit<RouteStop, 'id' | 'createdAt' | 'updatedAt'>): Promise<RouteStop>;
    update(id: string, data: Partial<RouteStop>): Promise<RouteStop>;
    delete(id: string): Promise<void>;
  };

  trips: {
    list(organizationId: string, filters?: TripListFilters): Promise<Trip[]>;
    get(id: string): Promise<Trip | null>;
    create(
      data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Trip, 'status'>>
    ): Promise<Trip>;
    update(id: string, data: Partial<Trip>): Promise<Trip>;
  };

  checkIns: {
    list(tripId: string): Promise<CheckIn[]>;
    listByPassenger(passengerId: string, limit?: number): Promise<CheckIn[]>;
    create(data: Omit<CheckIn, 'id' | 'createdAt' | 'recordedAt'> & Partial<Pick<CheckIn, 'recordedAt'>>): Promise<CheckIn>;
  };

  locations: {
    list(tripId: string): Promise<LocationSample[]>;
    append(data: Omit<LocationSample, 'id' | 'recordedAt'> & Partial<Pick<LocationSample, 'recordedAt'>>): Promise<LocationSample>;
  };

  notifications: {
    listByRecipient(recipientUserId: string): Promise<Notification[]>;
    create(data: Omit<Notification, 'id' | 'createdAt' | 'status'> & Partial<Pick<Notification, 'status'>>): Promise<Notification>;
    markSent(id: string, providerMessageId?: string): Promise<void>;
    markFailed(id: string, errorMessage: string): Promise<void>;
  };

  auditLogs: {
    list(organizationId: string): Promise<AuditLog[]>;
    create(data: Omit<AuditLog, 'id' | 'createdAt' | 'metadata'> & Partial<Pick<AuditLog, 'metadata'>>): Promise<AuditLog>;
  };

  files: {
    uploadCheckInPhoto(path: string, body: Blob | ArrayBuffer | Buffer, contentType?: string): Promise<string>;
    getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  };
}
