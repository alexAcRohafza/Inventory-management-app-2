'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface DatabaseContextValue {
  isOnline: boolean
  lastChecked: Date | null
  connectionStatus: 'connected' | 'disconnected' | 'checking'
  checkConnection: () => Promise<void>
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined)

export function useDatabaseConnection() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error('useDatabaseConnection must be used within a DatabaseConnectionProvider')
  }
  return context
}

export function DatabaseConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('connected')

  const checkConnection = async () => {
    setConnectionStatus('checking')
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        setIsOnline(true)
        setConnectionStatus('connected')
      } else {
        setIsOnline(false)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Database connection check failed:', error)
      setIsOnline(false)
      setConnectionStatus('disconnected')
    } finally {
      setLastChecked(new Date())
    }
  }

  // Check connection every 30 seconds
  useEffect(() => {
    // Initial check
    checkConnection()
    
    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Also check when coming back online
  useEffect(() => {
    const handleOnline = () => checkConnection()
    const handleOffline = () => {
      setIsOnline(false)
      setConnectionStatus('disconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value: DatabaseContextValue = {
    isOnline,
    lastChecked,
    connectionStatus,
    checkConnection
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
} 