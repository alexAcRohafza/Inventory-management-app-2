'use client'

import { useSession } from 'next-auth/react'
import { useDatabaseConnection } from '../contexts/DatabaseConnectionContext'
import Navigation from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const { isOnline, connectionStatus } = useDatabaseConnection()

  // Show connection status if offline
  const showConnectionBanner = !isOnline || connectionStatus === 'disconnected'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Banner */}
      {showConnectionBanner && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm text-center">
          <span className="mr-2">⚠️</span>
          {connectionStatus === 'disconnected' ? 'Database connection lost' : 'You are offline'}
          <span className="ml-2">Some features may not work correctly</span>
        </div>
      )}

      {/* Navigation - show for authenticated users */}
      {session && status === 'authenticated' && <Navigation />}

      {/* Main Content */}
      <main className={`${session ? '' : 'pt-0'}`}>
        {children}
      </main>

      {/* Connection Status in Bottom Corner (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-2 py-1 rounded text-xs font-mono ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            DB: {connectionStatus}
          </div>
        </div>
      )}
    </div>
  )
} 