'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReportingDashboard from '../components/ReportingDashboard'
import NotificationBell from '../components/NotificationBell'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'overview' | 'reports'>('overview')

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
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your inventory, generate reports, and import/export data
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏠 Overview
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Reports & Data
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* User Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-sm text-gray-900">{session.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="text-sm text-gray-900">{session.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.user.role === 'ADMIN' 
                        ? 'bg-green-100 text-green-800' 
                        : session.user.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveSection('reports')}
                    className="w-full flex items-center px-4 py-3 text-sm text-left text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span className="mr-3">📊</span>
                    View Reports & Analytics
                  </button>
                  <button 
                    onClick={() => setActiveSection('reports')}
                    className="w-full flex items-center px-4 py-3 text-sm text-left text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <span className="mr-3">📥</span>
                    Import CSV Data
                  </button>
                  <button 
                    onClick={() => setActiveSection('reports')}
                    className="w-full flex items-center px-4 py-3 text-sm text-left text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <span className="mr-3">📤</span>
                    Export Inventory Data
                  </button>
                  <button 
                    onClick={() => router.push('/inventory')}
                    className="w-full flex items-center px-4 py-3 text-sm text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="mr-3">📦</span>
                    Manage Inventory
                  </button>
                  {session.user.role === 'ADMIN' && (
                    <button 
                      onClick={() => router.push('/admin')}
                      className="w-full flex items-center px-4 py-3 text-sm text-left text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <span className="mr-3">⚙️</span>
                      Admin Settings
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total Items:</span>
                    <span className="text-2xl font-bold text-blue-600">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Low Stock Items:</span>
                    <span className="text-2xl font-bold text-red-600">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Locations:</span>
                    <span className="text-2xl font-bold text-green-600">-</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setActiveSection('reports')}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Detailed Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <ReportingDashboard />
        )}

        {/* Feature Highlights */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">✨ New Features Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-blue-900">Advanced Reports</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Generate comprehensive inventory reports with filters and analytics
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="text-2xl mb-2">📥</div>
                <h4 className="font-semibold text-green-900">CSV Import</h4>
                <p className="text-sm text-green-700 mt-1">
                  Bulk import inventory data from CSV files with validation
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="text-2xl mb-2">📤</div>
                <h4 className="font-semibold text-purple-900">Data Export</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Export your data to CSV for external analysis and backup
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 