import { UserRole } from '@/types'
import { Session } from 'next-auth'

/**
 * Role hierarchy for permission checking
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.WORKER]: 2,
  [UserRole.VENDOR]: 1,
}

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user has minimum role level
 */
export function hasMinimumRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session?.user?.role) return false
  return hasRole(session.user.role, requiredRole)
}

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.ADMIN
}

/**
 * Check if user is manager or higher
 */
export function isManagerOrHigher(session: Session | null): boolean {
  return hasMinimumRole(session, UserRole.MANAGER)
}

/**
 * Check if user can access inventory management
 */
export function canManageInventory(session: Session | null): boolean {
  return hasMinimumRole(session, UserRole.WORKER)
}

/**
 * Check if user can view reports
 */
export function canViewReports(session: Session | null): boolean {
  return hasMinimumRole(session, UserRole.WORKER)
}

/**
 * Check if user can manage users
 */
export function canManageUsers(session: Session | null): boolean {
  return hasMinimumRole(session, UserRole.MANAGER)
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager', 
    [UserRole.WORKER]: 'Worker',
    [UserRole.VENDOR]: 'Vendor',
  }
  return roleNames[role]
} 