'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Breadcrumb } from '../components/Navigation'

interface Notification {
  id: string
  type: 'low_stock' | 'stock_updated' | 'item_added' | 'item_removed' | 'inventory_movement' | 'system_alert'
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchNotifications()
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        // Fallback mock data
        setNotifications([
          {
            id: '1',
            type: 'low_stock',
            message: 'Widget A is running low on stock (5 remaining)',
            read: false,
            createdAt: new Date().toISOString(),
            metadata: { itemId: '1', quantity: 5 }
          },
          {
            id: '2',
            type: 'inventory_movement',
            message: '50 units of Component B moved to Zone A',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            metadata: { itemId: '2', quantity: 50, location: 'Zone A' }
          },
          {
            id: '3',
            type: 'item_added',
            message: 'New item "Part C" added to inventory',
            read: true,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            metadata: { itemId: '3', itemName: 'Part C' }
          },
          {
            id: '4',
            type: 'system_alert',
            message: 'Database backup completed successfully',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            metadata: { type: 'backup', status: 'success' }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return '⚠️'
      case 'stock_updated': return '📦'
      case 'item_added': return '➕'
      case 'item_removed': return '➖'
      case 'inventory_movement': return '🔄'
      case 'system_alert': return '🔔'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'border-l-red-500 bg-red-50'
      case 'stock_updated': return 'border-l-blue-500 bg-blue-50'
      case 'item_added': return 'border-l-green-500 bg-green-50'
      case 'item_removed': return 'border-l-orange-500 bg-orange-50'
      case 'inventory_movement': return 'border-l-purple-500 bg-purple-50'
      case 'system_alert': return 'border-l-gray-500 bg-gray-50'
      default: return 'border-l-gray-400 bg-gray-50'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock API call
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mock API call
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread': return !n.read
      case 'read': return n.read
      default: return true
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Notifications' }
        ]} />

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🔔 Notifications</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Stay updated with inventory alerts and system notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark All Read
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {(['all', 'unread', 'read'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      filter === filterType
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {filterType}
                    {filterType === 'unread' && unreadCount > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 rounded-r-lg cursor-pointer transition-colors ${
                      notification.read ? 'bg-gray-50' : getNotificationColor(notification.type)
                    } ${!notification.read ? 'hover:shadow-md' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔔</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filter === 'all' ? 'No notifications yet' :
                       filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
                    </h3>
                    <p className="text-gray-600">
                      {filter === 'all' 
                        ? 'You\'ll see inventory alerts and system updates here.'
                        : `Switch to "${filter === 'unread' ? 'all' : 'unread'}" to see more notifications.`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Notification Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">📦 Inventory Alerts</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Low stock alerts</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Movement notifications</span>
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">⚙️ System Alerts</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">System maintenance</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Backup status</span>
                    </label>
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