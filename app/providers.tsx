'use client'

import { SessionProvider } from 'next-auth/react'
import { InventoryProvider } from '../lib/contexts/InventoryContext'
import { SettingsProvider } from '../lib/contexts/SettingsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </SettingsProvider>
    </SessionProvider>
  )
} 