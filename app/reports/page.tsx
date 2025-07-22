'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ManagerOrAdmin } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface ReportSummary {
  id: string
  name: string
  description: string
  category: 'inventory' | 'movement' | 'analytics'
  lastGenerated?: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      // Mock data for now
      setReports([
        { id: '1', name: 'Inventory Summary', description: 'Current stock levels across all locations', category: 'inventory', lastGenerated: new Date().toISOString() },
        { id: '2', name: 'Low Stock Alert', description: 'Items below reorder threshold', category: 'inventory', lastGenerated: new Date().toISOString() },
        { id: '3', name: 'Movement History', description: 'All inventory movements in the last 30 days', category: 'movement', lastGenerated: new Date().toISOString() },
        { id: '4', name: 'Performance Analytics', description: 'Inventory turnover and efficiency metrics', category: 'analytics' }
      ])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return '📦'
      case 'movement': return '🔄'
      case 'analytics': return '📊'
      default: return '📄'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'bg-blue-100 text-blue-800'
      case 'movement': return 'bg-green-100 text-green-800'
      case 'analytics': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📊 Reports & Analytics</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Generate and view inventory reports and analytics
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Create Custom Report
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading reports...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryIcon(report.category)}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.category)}`}>
                              {report.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      
                      {report.lastGenerated && (
                        <p className="text-xs text-gray-500 mb-4">
                          Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                        </p>
                      )}
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                          Generate
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                          View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Quick Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">247</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <div className="text-sm text-gray-600">Low Stock</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">$45,230</div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">89</div>
                    <div className="text-sm text-gray-600">Movements Today</div>
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