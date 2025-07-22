'use client'

import { DatabaseConnectionProvider } from './contexts/DatabaseConnectionContext'
import { AuthProvider } from './contexts/AuthProvider'
import { InventoryProvider } from '../lib/contexts/InventoryContext'
import { SettingsProvider } from '../lib/contexts/SettingsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DatabaseConnectionProvider>
      <AuthProvider>
        <InventoryProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </InventoryProvider>
      </AuthProvider>
    </DatabaseConnectionProvider>
  )
} 