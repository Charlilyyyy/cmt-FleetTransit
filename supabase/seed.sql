-- CMT Fleet Transit — development seed data
-- DO NOT run on production. For local / staging only.
--
-- Fixed UUIDs for reproducible tests:
--   ORG_A:  a0000000-0000-4000-8000-000000000001
--   ORG_B:  b0000000-0000-4000-8000-000000000001

-- SuperAdmin (no org)
INSERT INTO users (id, organization_id, firebase_uid, role, phone, first_name, last_name)
VALUES (
  'f0000000-0000-4000-8000-000000000001',
  NULL,
  'dev-superadmin',
  'superadmin',
  '+15550000000',
  'Super',
  'Admin'
);

-- Organization A: Lincoln Transport
INSERT INTO organizations (id, name, slug, contact_email, photo_proof_required)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Lincoln Transport',
  'lincoln-transport',
  'admin@lincoln-transport.dev',
  false
);

INSERT INTO users (id, organization_id, firebase_uid, role, phone, first_name, last_name) VALUES
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'dev-admin-a',  'admin',  '+15550001001', 'Alice', 'Admin'),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'dev-staff-a',  'staff',  '+15550001002', 'Sam',   'Staff'),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'dev-driver-a', 'driver', '+15550001003', 'Juan',  'Driver'),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'dev-parent-a1','parent', '+15550001004', 'Maria', 'Guardian'),
  ('a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'dev-parent-a2','parent', '+15550001005', 'Leo',   'Guardian');

INSERT INTO schools (id, organization_id, name, address, lat, lng)
VALUES (
  'a0000000-0000-4000-8000-000000000010',
  'a0000000-0000-4000-8000-000000000001',
  'Lincoln Elementary',
  '100 School Lane',
  14.5995,
  120.9842
);

INSERT INTO vehicles (id, organization_id, label, license_plate, seat_capacity, vehicle_type)
VALUES (
  'a0000000-0000-4000-8000-000000000020',
  'a0000000-0000-4000-8000-000000000001',
  'Bus 12',
  'LIN-012',
  40,
  'bus'
);

INSERT INTO drivers (id, organization_id, user_id, license_number, emergency_contact)
VALUES (
  'a0000000-0000-4000-8000-000000000030',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000004',
  'DL-12345',
  '+15559999001'
);

INSERT INTO passengers (id, organization_id, school_id, first_name, last_name, grade, default_stop_lat, default_stop_lng, default_stop_address, otp_secret) VALUES
  ('a0000000-0000-4000-8000-000000000040', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010', 'Maria', 'Santos', '3', 14.6010, 120.9820, 'Oak St & 4th Ave', '1234'),
  ('a0000000-0000-4000-8000-000000000041', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010', 'Leo',   'Torres', '5', 14.6020, 120.9830, 'Pine Ave & 12th',  '2345'),
  ('a0000000-0000-4000-8000-000000000042', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010', 'Ana',   'Kim',    '2', 14.6030, 120.9840, 'Elm St & 8th',    '3456');

INSERT INTO passenger_guardians (id, organization_id, passenger_id, guardian_user_id, relationship, is_primary) VALUES
  ('a0000000-0000-4000-8000-000000000045', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000040', 'a0000000-0000-4000-8000-000000000005', 'mother', true),
  ('a0000000-0000-4000-8000-000000000046', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000041', 'a0000000-0000-4000-8000-000000000006', 'father', true);

INSERT INTO routes (id, organization_id, school_id, vehicle_id, name, direction, total_distance_m, estimated_duration_s)
VALUES (
  'a0000000-0000-4000-8000-000000000050',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000010',
  'a0000000-0000-4000-8000-000000000020',
  'AM Lincoln Pickup',
  'pickup',
  18400,
  2520
);

INSERT INTO route_stops (id, organization_id, route_id, sequence, passenger_id, lat, lng, address_label) VALUES
  ('a0000000-0000-4000-8000-000000000051', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000050', 1, NULL, 14.5980, 120.9810, 'Depot'),
  ('a0000000-0000-4000-8000-000000000052', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000050', 2, 'a0000000-0000-4000-8000-000000000040', 14.6010, 120.9820, 'Oak St & 4th Ave'),
  ('a0000000-0000-4000-8000-000000000053', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000050', 3, 'a0000000-0000-4000-8000-000000000041', 14.6020, 120.9830, 'Pine Ave & 12th'),
  ('a0000000-0000-4000-8000-000000000054', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000050', 4, 'a0000000-0000-4000-8000-000000000042', 14.6030, 120.9840, 'Elm St & 8th'),
  ('a0000000-0000-4000-8000-000000000055', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000050', 5, NULL, 14.5995, 120.9842, 'Lincoln Elementary');

INSERT INTO trips (id, organization_id, route_id, driver_id, vehicle_id, scheduled_date, scheduled_start_at, status)
VALUES (
  'a0000000-0000-4000-8000-000000000060',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000050',
  'a0000000-0000-4000-8000-000000000030',
  'a0000000-0000-4000-8000-000000000020',
  CURRENT_DATE + 1,
  (CURRENT_DATE + 1 + TIME '07:00:00')::timestamptz,
  'scheduled'
);

-- Organization B: Metro Shuttle Co (RLS test)
INSERT INTO organizations (id, name, slug, contact_email)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'Metro Shuttle Co',
  'metro-shuttle',
  'admin@metro-shuttle.dev'
);

INSERT INTO users (id, organization_id, firebase_uid, role, phone, first_name, last_name)
VALUES (
  'b0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000001',
  'dev-admin-b',
  'admin',
  '+15550002001',
  'Bob',
  'Admin'
);

INSERT INTO schools (id, organization_id, name, address)
VALUES (
  'b0000000-0000-4000-8000-000000000010',
  'b0000000-0000-4000-8000-000000000001',
  'Riverside Academy',
  '200 River Rd'
);

INSERT INTO passengers (id, organization_id, school_id, first_name, last_name, otp_secret)
VALUES (
  'b0000000-0000-4000-8000-000000000040',
  'b0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000010',
  'Other',
  'Student',
  '9999'
);
