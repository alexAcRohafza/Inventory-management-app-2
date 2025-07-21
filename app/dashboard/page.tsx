'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/login')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome to your inventory management system
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">User Info</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {session.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {session.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Role:</span>{' '}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.user.role === 'ADMIN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.user.role}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900">Quick Actions</h3>
                  <div className="mt-3 space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded">
                      View Inventory
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded">
                      Add New Item
                    </button>
                    {session.user.role === 'ADMIN' && (
                      <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded">
                        Admin Settings
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900">Statistics</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">Total Items: 0</p>
                    <p className="text-sm text-green-700">Low Stock: 0</p>
                    <p className="text-sm text-green-700">Categories: 0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 