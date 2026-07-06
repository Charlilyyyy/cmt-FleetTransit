-- CMT Fleet Transit — performance indexes

-- organizations
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(organization_id, role);

-- schools
CREATE INDEX IF NOT EXISTS idx_schools_org_id ON schools(organization_id);
CREATE INDEX IF NOT EXISTS idx_schools_org_status ON schools(organization_id, status);

-- vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_org_id ON vehicles(organization_id);

-- drivers
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_org_id ON drivers(organization_id);

-- passengers
CREATE INDEX IF NOT EXISTS idx_passengers_org_id ON passengers(organization_id);
CREATE INDEX IF NOT EXISTS idx_passengers_org_school ON passengers(organization_id, school_id);
CREATE INDEX IF NOT EXISTS idx_passengers_org_name ON passengers(organization_id, last_name, first_name);

-- passenger_guardians
CREATE INDEX IF NOT EXISTS idx_pg_guardian ON passenger_guardians(guardian_user_id);
CREATE INDEX IF NOT EXISTS idx_pg_passenger ON passenger_guardians(passenger_id);
CREATE INDEX IF NOT EXISTS idx_pg_org_guardian ON passenger_guardians(organization_id, guardian_user_id);

-- guardian_devices
CREATE INDEX IF NOT EXISTS idx_gd_user_channel ON guardian_devices(user_id, channel);

-- routes
CREATE INDEX IF NOT EXISTS idx_routes_org_id ON routes(organization_id);
CREATE INDEX IF NOT EXISTS idx_routes_org_active ON routes(organization_id, is_active);

-- route_stops
CREATE INDEX IF NOT EXISTS idx_route_stops_route_seq ON route_stops(route_id, sequence);
CREATE INDEX IF NOT EXISTS idx_route_stops_passenger ON route_stops(passenger_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_org ON route_stops(organization_id);

-- trips
CREATE INDEX IF NOT EXISTS idx_trips_org_date_status ON trips(organization_id, scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_active ON trips(organization_id, scheduled_date)
  WHERE status IN ('scheduled', 'active');

-- check_ins
CREATE INDEX IF NOT EXISTS idx_checkins_trip_id ON check_ins(trip_id);
CREATE INDEX IF NOT EXISTS idx_checkins_passenger ON check_ins(passenger_id);
CREATE INDEX IF NOT EXISTS idx_checkins_org_trip ON check_ins(organization_id, trip_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_client_event ON check_ins(client_event_id)
  WHERE client_event_id IS NOT NULL;

-- locations
CREATE INDEX IF NOT EXISTS idx_locations_trip_time ON locations(trip_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_org_trip ON locations(organization_id, trip_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_status ON notifications(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(organization_id, entity_type, entity_id);
