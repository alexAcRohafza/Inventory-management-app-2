import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
} 