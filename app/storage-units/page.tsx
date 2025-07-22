'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface StorageUnit {
  id: string
  name: string
  areaId: string
  areaName: string
  locationName: string
  itemsCount?: number
}

export default function StorageUnitsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchStorageUnits()
  }, [session, status, router])

  const fetchStorageUnits = async () => {
    try {
      // Mock data for now
      setUnits([
        { id: '1', name: 'A-001', areaId: '1', areaName: 'Zone A', locationName: 'Main Warehouse', itemsCount: 25 },
        { id: '2', name: 'A-002', areaId: '1', areaName: 'Zone A', locationName: 'Main Warehouse', itemsCount: 18 },
        { id: '3', name: 'B-001', areaId: '2', areaName: 'Zone B', locationName: 'Main Warehouse', itemsCount: 32 }
      ])
    } catch (error) {
      console.error('Failed to fetch storage units:', error)
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
    <WorkerAndUp fallback={<div className="p-8 text-center text-red-600">Access denied</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Storage Units' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📦 Storage Units</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage individual storage containers and bins
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Add Storage Unit
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading storage units...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {units.map((unit) => (
                    <div key={unit.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{unit.name}</h3>
                        <span className="text-xl">📦</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">📍 {unit.areaName}</p>
                      <p className="text-xs text-gray-500 mb-3">🏢 {unit.locationName}</p>
                      <p className="text-sm text-blue-600 mb-3">
                        {unit.itemsCount} items stored
                      </p>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors">
                          View Items
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 