'use client'

import React, { createContext, useContext } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { UserRole } from '@/types'

interface AuthContextValue {
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  isAdmin: boolean
  isManager: boolean
  isWorker: boolean
  isVendor: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole

  const hasRole = (role: UserRole) => userRole === role
  const hasAnyRole = (roles: UserRole[]) => roles.includes(userRole)
  
  const isAdmin = userRole === UserRole.ADMIN
  const isManager = userRole === UserRole.MANAGER
  const isWorker = userRole === UserRole.WORKER
  const isVendor = userRole === UserRole.VENDOR

  const value: AuthContextValue = {
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isWorker,
    isVendor
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
} 