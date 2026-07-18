import type { UserRole } from '@cmt/shared';

/** Higher number = more privilege. */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 5,
  admin: 4,
  staff: 3,
  driver: 2,
  parent: 1,
};

export function hasAtLeastRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** Tenant isolation: superadmin spans orgs; everyone else is bound to their own org. */
export function canAccessOrganization(
  userRole: UserRole,
  userOrganizationId: string | null | undefined,
  targetOrganizationId: string
): boolean {
  if (userRole === 'superadmin') return true;
  return !!userOrganizationId && userOrganizationId === targetOrganizationId;
}

export type Resource =
  | 'organizations'
  | 'users'
  | 'schools'
  | 'vehicles'
  | 'drivers'
  | 'passengers'
  | 'routes'
  | 'trips'
  | 'checkIns'
  | 'notifications'
  | 'auditLogs';

export type Action = 'create' | 'read' | 'update' | 'delete';

export const PERMISSIONS: Record<Resource, Record<Action, UserRole[]>> = {
  organizations: {
    create: ['superadmin'],
    read: ['superadmin', 'admin', 'staff'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin'],
  },
  users: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  schools: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  vehicles: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  drivers: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  passengers: {
    create: ['superadmin', 'admin', 'staff'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin', 'staff'],
    delete: ['superadmin', 'admin'],
  },
  routes: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  trips: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin', 'driver'],
    delete: ['superadmin', 'admin'],
  },
  checkIns: {
    create: ['superadmin', 'admin', 'driver'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin'],
  },
  notifications: {
    create: ['superadmin', 'admin', 'staff'],
    read: ['superadmin', 'admin', 'staff', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  auditLogs: {
    create: ['superadmin', 'admin', 'staff', 'driver'],
    read: ['superadmin', 'admin'],
    update: [],
    delete: [],
  },
};

export function can(userRole: UserRole, resource: Resource, action: Action): boolean {
  return PERMISSIONS[resource]?.[action]?.includes(userRole) ?? false;
}

/** Default landing route per role after login. */
export function homeRouteForRole(role: UserRole): string {
  switch (role) {
    case 'superadmin':
    case 'admin':
    case 'staff':
      return '/dashboard';
    case 'driver':
      return '/driver';
    case 'parent':
      return '/parent/tracking';
    default:
      return '/';
  }
}
