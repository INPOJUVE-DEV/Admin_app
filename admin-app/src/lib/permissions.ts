import { Permission, SessionResponse } from '../types/auth'

export function hasPermission(session: SessionResponse | null, permission: Permission) {
  return Boolean(session?.permissions.includes(permission))
}

export function hasAnyPermission(session: SessionResponse | null, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(session, permission))
}
