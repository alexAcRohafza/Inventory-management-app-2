'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@/types'
import { checkPermission, type PermissionGuardProps } from '@/lib/access-control'

export default function PermissionGuard({
  requiredRole,
  requiredRoles,
  children,
  fallback = null
}: PermissionGuardProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole

  const hasPermission = checkPermission(userRole, requiredRole, requiredRoles)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ManagerOrAdmin({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function WorkerAndUp({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER]} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function VendorAccess({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR]} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
} 