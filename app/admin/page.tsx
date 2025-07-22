'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Breadcrumb } from '../components/Navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalMovements: 0,
    totalNotifications: 0
  })
  const [showAlertsModal, setShowAlertsModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
    
    // Fetch system statistics
    fetchSystemStats()
  }, [session, status, router])

  const handleShowAlerts = () => {
    setShowAlertsModal(true)
  }

  const fetchSystemStats = async () => {
    try {
      // This would normally fetch from various API endpoints
      // For now, we'll show mock data
      setSystemStats({
        totalUsers: 3,
        totalItems: 7,
        totalMovements: 4,
        totalNotifications: 3
      })
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin Panel' }
          ]} 
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            System administration and management tools
          </p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">👥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {systemStats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📦</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {systemStats.totalItems}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🔄</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Movements
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {systemStats.totalMovements}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🔔</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Notifications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {systemStats.totalNotifications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Management
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏗️</span>
                    <div>
                      <div className="font-medium text-blue-900">Database Management</div>
                      <div className="text-sm text-blue-700">Manage database operations and backups</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <button 
                  onClick={() => router.push('/users')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <div className="font-medium text-green-900">User Management</div>
                      <div className="text-sm text-green-700">Create, edit, and manage user accounts</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <button 
                  onClick={() => router.push('/reports')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <div className="font-medium text-purple-900">System Reports</div>
                      <div className="text-sm text-purple-700">Generate comprehensive system reports</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Tools
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/inventory')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    <div>
                      <div className="font-medium text-gray-900">Inventory Overview</div>
                      <div className="text-sm text-gray-700">Quick access to inventory management</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚙️</span>
                    <div>
                      <div className="font-medium text-yellow-900">System Settings</div>
                      <div className="text-sm text-yellow-700">Configure system preferences</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <button 
                  onClick={handleShowAlerts}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚨</span>
                    <div>
                      <div className="font-medium text-red-900">System Alerts</div>
                      <div className="text-sm text-red-700">Monitor critical system alerts</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent System Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Database seed completed successfully</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Recently</time>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                      <span className="text-white text-sm">📦</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Inventory system initialized with sample data</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Recently</time>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 ring-8 ring-white">
                      <span className="text-white text-sm">🚀</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Application deployed and ready for use</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Recently</time>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🚨 System Alerts</h3>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Mock system alerts */}
              <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">🔴</span>
                  <div className="flex-1">
                    <div className="font-medium text-red-900">Low Stock Alert</div>
                    <div className="text-sm text-red-700">5 items are below reorder threshold</div>
                    <div className="text-xs text-red-600 mt-1">2 hours ago</div>
                  </div>
                </div>
              </div>
              
              <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-2">🟡</span>
                  <div className="flex-1">
                    <div className="font-medium text-yellow-900">Storage Capacity Warning</div>
                    <div className="text-sm text-yellow-700">Zone A is 85% full</div>
                    <div className="text-xs text-yellow-600 mt-1">4 hours ago</div>
                  </div>
                </div>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">🔵</span>
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">System Update</div>
                    <div className="text-sm text-blue-700">Database backup completed successfully</div>
                    <div className="text-xs text-blue-600 mt-1">6 hours ago</div>
                  </div>
                </div>
              </div>
              
              <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">🟢</span>
                  <div className="flex-1">
                    <div className="font-medium text-green-900">System Status</div>
                    <div className="text-sm text-green-700">All systems operating normally</div>
                    <div className="text-xs text-green-600 mt-1">8 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => alert('Alert settings opened (feature coming soon)')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 