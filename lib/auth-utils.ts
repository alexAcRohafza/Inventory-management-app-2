import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { UserRole } from '@/types'

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth()
  if (session.user?.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  return session
}

export async function hasRole(role: UserRole) {
  const session = await getServerAuthSession()
  return session?.user?.role === role
}

export async function isAdmin() {
  return await hasRole(UserRole.ADMIN)
}

export async function isManager() {
  return await hasRole(UserRole.MANAGER)
}

export async function isWorker() {
  return await hasRole(UserRole.WORKER)
}

export async function isVendor() {
  return await hasRole(UserRole.VENDOR)
}

export async function hasAnyRole(roles: UserRole[]) {
  const session = await getServerAuthSession()
  return roles.includes(session?.user?.role as UserRole)
} 