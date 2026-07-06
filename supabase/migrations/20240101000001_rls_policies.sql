-- CMT Fleet Transit — Row-Level Security policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- JWT helper functions (claims set by application after Firebase auth)
CREATE OR REPLACE FUNCTION app_firebase_uid()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION app_organization_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'organization_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION app_user_role()
RETURNS user_role AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::user_role;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION app_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE firebase_uid = app_firebase_uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION app_is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT app_user_role() = 'superadmin';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION app_linked_passenger_ids()
RETURNS SETOF UUID AS $$
  SELECT passenger_id FROM passenger_guardians
  WHERE guardian_user_id = app_user_id()
    AND organization_id = app_organization_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION app_assigned_trip_ids()
RETURNS SETOF UUID AS $$
  SELECT t.id FROM trips t
  JOIN drivers d ON d.id = t.driver_id
  WHERE d.user_id = app_user_id()
    AND t.organization_id = app_organization_id()
    AND t.status IN ('scheduled', 'active');
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- organizations
CREATE POLICY org_superadmin_select ON organizations
  FOR SELECT USING (app_is_superadmin());

CREATE POLICY org_superadmin_update ON organizations
  FOR UPDATE USING (app_is_superadmin());

CREATE POLICY org_superadmin_insert ON organizations
  FOR INSERT WITH CHECK (app_is_superadmin());

CREATE POLICY org_member_select ON organizations
  FOR SELECT USING (id = app_organization_id());

-- users
CREATE POLICY users_admin_all ON users
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY users_staff_select ON users
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() = 'staff'
  );

CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = app_user_id());

CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = app_user_id());

CREATE POLICY users_superadmin_select ON users
  FOR SELECT USING (app_is_superadmin());

-- schools
CREATE POLICY schools_admin_all ON schools
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY schools_staff_select ON schools
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() IN ('staff', 'driver')
  );

-- vehicles
CREATE POLICY vehicles_admin_all ON vehicles
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY vehicles_staff_driver_select ON vehicles
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() IN ('staff', 'driver')
  );

-- drivers
CREATE POLICY drivers_admin_all ON drivers
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY drivers_staff_select ON drivers
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() = 'staff'
  );

CREATE POLICY drivers_self_select ON drivers
  FOR SELECT USING (user_id = app_user_id());

-- passengers
CREATE POLICY passengers_admin_all ON passengers
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY passengers_staff_select ON passengers
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() = 'staff'
  );

CREATE POLICY passengers_parent_select ON passengers
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'parent'
    AND id IN (SELECT app_linked_passenger_ids())
  );

-- passenger_guardians
CREATE POLICY pg_admin_all ON passenger_guardians
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY pg_parent_select ON passenger_guardians
  FOR SELECT USING (
    guardian_user_id = app_user_id() AND app_user_role() = 'parent'
  );

-- guardian_devices
CREATE POLICY gd_parent_all ON guardian_devices
  FOR ALL USING (
    user_id = app_user_id() AND app_user_role() = 'parent'
  ) WITH CHECK (
    user_id = app_user_id()
    AND organization_id = app_organization_id()
    AND app_user_role() = 'parent'
  );

-- routes
CREATE POLICY routes_admin_all ON routes
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY routes_staff_driver_select ON routes
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() IN ('staff', 'driver')
  );

-- route_stops
CREATE POLICY route_stops_admin_all ON route_stops
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY route_stops_staff_driver_select ON route_stops
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() IN ('staff', 'driver')
  );

-- trips
CREATE POLICY trips_admin_all ON trips
  FOR ALL USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  ) WITH CHECK (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY trips_staff_select ON trips
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() = 'staff'
  );

CREATE POLICY trips_driver_select ON trips
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND id IN (SELECT app_assigned_trip_ids())
  );

CREATE POLICY trips_driver_update ON trips
  FOR UPDATE USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND id IN (SELECT app_assigned_trip_ids())
  );

CREATE POLICY trips_parent_select ON trips
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'parent'
    AND EXISTS (
      SELECT 1 FROM route_stops rs
      JOIN passenger_guardians pg ON pg.passenger_id = rs.passenger_id
      WHERE rs.route_id = trips.route_id
        AND pg.guardian_user_id = app_user_id()
    )
  );

-- check_ins
CREATE POLICY checkins_admin_staff_select ON check_ins
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() IN ('admin', 'staff')
  );

CREATE POLICY checkins_driver_insert ON check_ins
  FOR INSERT WITH CHECK (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND trip_id IN (SELECT app_assigned_trip_ids())
    AND driver_user_id = app_user_id()
  );

CREATE POLICY checkins_driver_select ON check_ins
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND trip_id IN (SELECT app_assigned_trip_ids())
  );

CREATE POLICY checkins_parent_select ON check_ins
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'parent'
    AND passenger_id IN (SELECT app_linked_passenger_ids())
  );

-- locations
CREATE POLICY locations_admin_staff_select ON locations
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() IN ('admin', 'staff')
  );

CREATE POLICY locations_driver_insert ON locations
  FOR INSERT WITH CHECK (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND trip_id IN (SELECT app_assigned_trip_ids())
  );

CREATE POLICY locations_driver_select ON locations
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'driver'
    AND trip_id IN (SELECT app_assigned_trip_ids())
  );

CREATE POLICY locations_parent_select ON locations
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() = 'parent'
    AND trip_id IN (
      SELECT t.id FROM trips t
      WHERE t.organization_id = app_organization_id()
      AND EXISTS (
        SELECT 1 FROM route_stops rs
        JOIN passenger_guardians pg ON pg.passenger_id = rs.passenger_id
        WHERE rs.route_id = t.route_id AND pg.guardian_user_id = app_user_id()
      )
    )
  );

-- notifications
CREATE POLICY notifications_admin_select ON notifications
  FOR SELECT USING (
    organization_id = app_organization_id() AND app_user_role() = 'admin'
  );

CREATE POLICY notifications_parent_select ON notifications
  FOR SELECT USING (
    recipient_user_id = app_user_id() AND app_user_role() = 'parent'
  );

-- audit_logs (insert only + select; no update/delete)
CREATE POLICY audit_admin_staff_select ON audit_logs
  FOR SELECT USING (
    organization_id = app_organization_id()
    AND app_user_role() IN ('admin', 'staff')
  );

CREATE POLICY audit_superadmin_select ON audit_logs
  FOR SELECT USING (app_is_superadmin());

CREATE POLICY audit_insert ON audit_logs
  FOR INSERT WITH CHECK (
    organization_id = app_organization_id()
  );
