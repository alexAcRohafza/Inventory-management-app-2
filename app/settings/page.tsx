'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ManagerOrAdmin } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface Settings {
  lowStockThreshold: number
  autoReorderEnabled: boolean
  notificationsEnabled: boolean
  systemMaintenanceMode: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    lowStockThreshold: 10,
    autoReorderEnabled: false,
    notificationsEnabled: true,
    systemMaintenanceMode: false,
    backupFrequency: 'daily'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <ManagerOrAdmin fallback={<div className="p-8 text-center text-red-600">Access denied - Manager or Admin role required</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Settings' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">⚙️ System Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Configure system preferences and thresholds
                </p>
              </div>

              <div className="space-y-6">
                {/* Inventory Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">📦 Inventory Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Items below this quantity will trigger low stock alerts</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Reorder
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.autoReorderEnabled}
                          onChange={(e) => setSettings({...settings, autoReorderEnabled: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable automatic reordering</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Automatically create purchase orders when stock is low</p>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">🔔 Notification Settings</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notificationsEnabled}
                        onChange={(e) => setSettings({...settings, notificationsEnabled: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable system notifications</span>
                    </div>
                  </div>
                </div>

                {/* System Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">🔧 System Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({...settings, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {session?.user?.role === 'ADMIN' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maintenance Mode
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.systemMaintenanceMode}
                            onChange={(e) => setSettings({...settings, systemMaintenanceMode: e.target.checked})}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable maintenance mode</span>
                        </div>
                        <p className="text-xs text-red-500 mt-1">Caution: This will disable user access to the system</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">ℹ️ System Information</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Version: v2.1.0</p>
                    <p>Database: PostgreSQL (Connected)</p>
                    <p>Last Backup: {new Date().toLocaleDateString()}</p>
                    <p>Uptime: 99.9%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManagerOrAdmin>
  )
} 