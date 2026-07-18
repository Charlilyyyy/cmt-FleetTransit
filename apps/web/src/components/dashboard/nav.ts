import type { UserRole } from '@cmt/shared';

export interface NavItem {
  href: string;
  label: string;
  /** Minimum roles allowed to see the item. */
  roles: UserRole[];
}

const ALL_STAFF: UserRole[] = ['superadmin', 'admin', 'staff'];
const ADMINS: UserRole[] = ['superadmin', 'admin'];

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', roles: ALL_STAFF },
  { href: '/dashboard/trips', label: 'Trips', roles: ALL_STAFF },
  { href: '/dashboard/routes', label: 'Routes', roles: ALL_STAFF },
  { href: '/dashboard/vehicles', label: 'Vehicles', roles: ALL_STAFF },
  { href: '/dashboard/drivers', label: 'Drivers', roles: ADMINS },
  { href: '/dashboard/passengers', label: 'Passengers', roles: ALL_STAFF },
  { href: '/dashboard/schools', label: 'Schools', roles: ALL_STAFF },
  { href: '/dashboard/users', label: 'Users', roles: ADMINS },
  { href: '/dashboard/reports', label: 'Reports', roles: ALL_STAFF },
  { href: '/dashboard/audit', label: 'Audit', roles: ADMINS },
  { href: '/dashboard/settings', label: 'Settings', roles: ALL_STAFF },
];

export function visibleNav(role: UserRole | undefined): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
