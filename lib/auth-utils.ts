import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@/types"
import { hasApiAccess } from "@/lib/access-control"

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth(requiredRoles?: UserRole[]) {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  if (requiredRoles && !hasApiAccess(session.user.role as UserRole, requiredRoles)) {
    throw new Error("Insufficient permissions")
  }

  return session
}

export async function canAccess(requiredRoles: UserRole[]) {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    return false
  }

  return hasApiAccess(session.user.role as UserRole, requiredRoles)
} 