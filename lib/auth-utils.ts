import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user?.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  return session
}

export async function hasRole(role: string) {
  const session = await getServerAuthSession()
  return session?.user?.role === role
}

export async function isAdmin() {
  return await hasRole('ADMIN')
} 