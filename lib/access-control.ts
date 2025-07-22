import { UserRole } from '@/types'

// Permission helpers for different actions
export const canEditItems = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canViewReports = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canManageUsers = (role: UserRole): boolean => {
  return role === UserRole.ADMIN
}

export const canViewInventory = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER].includes(role)
}

export const canCreateMovements = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER].includes(role)
}

export const canViewAnalytics = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canManageLocations = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canViewVendors = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR].includes(role)
}

export const canEditVendors = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canViewSettings = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canViewMap = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER].includes(role)
}

export const canManageNotifications = (role: UserRole): boolean => {
  return true // All authenticated users can manage their own notifications
}

export const canImportData = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

export const canExportData = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.MANAGER].includes(role)
}

// Menu visibility helpers
export const getVisibleMenuItems = (role: UserRole | undefined) => {
  if (!role) return []

  const baseItems = [
    { href: '/', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR] }
  ]

  const menuItems = [
    { href: '/locations', label: 'Locations', icon: '🏢', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/areas', label: 'Areas', icon: '📍', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/storage-units', label: 'Storage Units', icon: '📦', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/items', label: 'Items', icon: '🏷️', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/inventory-movements', label: 'Movements', icon: '🔄', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/reports', label: 'Reports', icon: '📊', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { href: '/vendors', label: 'Vendors', icon: '🏪', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
    { href: '/users', label: 'Users', icon: '👥', roles: [UserRole.ADMIN] },
    { href: '/settings', label: 'Settings', icon: '⚙️', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { href: '/map', label: 'Site Map', icon: '🗺️', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER] },
    { href: '/notifications', label: 'Notifications', icon: '🔔', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR] }
  ]

  const allItems = [...baseItems, ...menuItems]
  return allItems.filter(item => item.roles.includes(role))
}

// API access control helper
export const hasApiAccess = (userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

// Permission guard component helper
export interface PermissionGuardProps {
  role?: UserRole
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const checkPermission = (
  userRole: UserRole | undefined,
  requiredRole?: UserRole,
  requiredRoles?: UserRole[]
): boolean => {
  if (!userRole) return false
  
  if (requiredRole) {
    return userRole === requiredRole
  }
  
  if (requiredRoles) {
    return requiredRoles.includes(userRole)
  }
  
  return false
} 