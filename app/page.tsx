'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserRole } from '@/types'
import { getVisibleMenuItems } from '@/lib/access-control'
import PermissionGuard, { ManagerOrAdmin, WorkerAndUp } from './components/PermissionGuard'

interface DashboardStats {
  totalItems: number
  lowStockItems: number
  totalMovements: number
  unreadNotifications: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    totalMovements: 0,
    unreadNotifications: 0
  })
  const [loading, setLoading] = useState(true)

  // Always call useEffect - hooks must be called in same order every render
  useEffect(() => {
    // Only fetch stats if we have a session
    if (!session) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        // Fetch dashboard stats (implement these API endpoints)
        const [itemsRes, notificationsRes] = await Promise.all([
          fetch('/api/items?summary=true'),
          fetch('/api/notifications?unreadOnly=true&limit=1')
        ])

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setStats(prev => ({
            ...prev,
            totalItems: itemsData.total || 0,
            lowStockItems: itemsData.lowStock || 0
          }))
        }

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setStats(prev => ({
            ...prev,
            unreadNotifications: notificationsData.total || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session]) // Add session as dependency

  // After all hooks are called, we can do conditional returns
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <PublicLandingPage />
  }

  const userRole = session.user?.role as UserRole
  const quickLinks = getVisibleMenuItems(userRole).slice(1, 7) // Skip dashboard, take next 6

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name || session.user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600">
            {getRoleGreeting(userRole)} Here's your inventory overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <WorkerAndUp>
            <StatsCard
              title="Total Items"
              value={loading ? '...' : stats.totalItems.toString()}
              icon="📦"
              color="blue"
            />
            <StatsCard
              title="Low Stock Alert"
              value={loading ? '...' : stats.lowStockItems.toString()}
              icon="⚠️"
              color="red"
              link="/items?filter=lowStock"
            />
          </WorkerAndUp>
          
          <StatsCard
            title="Notifications"
            value={loading ? '...' : stats.unreadNotifications.toString()}
            icon="🔔"
            color="yellow"
            link="/notifications"
          />

          <ManagerOrAdmin>
            <StatsCard
              title="Recent Movements"
              value={loading ? '...' : stats.totalMovements.toString()}
              icon="🔄"
              color="green"
              link="/inventory-movements"
            />
          </ManagerOrAdmin>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Quick Actions</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="mr-3 text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <ManagerOrAdmin>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Reports & Analytics</h3>
              <div className="space-y-3">
                <Link href="/reports" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <span className="mr-3 text-lg">📈</span>
                  <span>View Reports</span>
                </Link>
                <Link href="/reports?type=inventory" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <span className="mr-3 text-lg">📦</span>
                  <span>Inventory Report</span>
                </Link>
                <Link href="/reports?type=movements" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <span className="mr-3 text-lg">🔄</span>
                  <span>Movement Report</span>
                </Link>
              </div>
            </div>
          </ManagerOrAdmin>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-gray-500 text-sm">Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {userRole === UserRole.VENDOR && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🏪 Vendor Portal</h3>
            <p className="text-blue-800 mb-4">
              Welcome to your vendor portal. You can view your products and check inventory levels.
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Vendor Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function PublicLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📦 Inventory Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete inventory tracking with real-time notifications, AI analytics, and comprehensive reporting
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/login" className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
            <p className="text-blue-700">Sign in to access your inventory dashboard</p>
          </Link>

          <div className="block p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Features</h3>
            <p className="text-green-700">Real-time tracking, AI analytics, role-based access</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🧪 Test Accounts</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
            <p><strong>Manager:</strong> manager@example.com / manager123</p>
            <p><strong>Worker:</strong> worker@example.com / worker123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  link 
}: { 
  title: string
  value: string
  icon: string
  color: 'blue' | 'red' | 'yellow' | 'green'
  link?: string 
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500', 
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  }

  const content = (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-full p-3 mr-4`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  if (link) {
    return <Link href={link} className="block hover:scale-105 transition-transform">{content}</Link>
  }

  return content
}

function getRoleGreeting(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "As an administrator, you have full system access."
    case UserRole.MANAGER:
      return "As a manager, you can oversee inventory operations."
    case UserRole.WORKER:
      return "As a worker, you can manage inventory items and movements."
    case UserRole.VENDOR:
      return "As a vendor, you can view your products and inventory status."
    default:
      return ""
  }
} 