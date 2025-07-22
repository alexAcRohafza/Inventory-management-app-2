'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface Area {
  id: string
  name: string
  locationId: string
  locationName: string
  storageUnitsCount?: number
}

export default function AreasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchAreas()
  }, [session, status, router])

  const fetchAreas = async () => {
    try {
      // Mock data for now
      setAreas([
        { id: '1', name: 'Zone A', locationId: '1', locationName: 'Main Warehouse', storageUnitsCount: 12 },
        { id: '2', name: 'Zone B', locationId: '1', locationName: 'Main Warehouse', storageUnitsCount: 8 },
        { id: '3', name: 'Cold Storage', locationId: '2', locationName: 'Storage Facility B', storageUnitsCount: 6 }
      ])
    } catch (error) {
      console.error('Failed to fetch areas:', error)
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
            { label: 'Areas' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📍 Areas</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage warehouse areas and zones
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Add Area
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading areas...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {areas.map((area) => (
                    <div key={area.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                        <span className="text-2xl">📍</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">🏢 {area.locationName}</p>
                      <p className="text-sm text-blue-600 mb-4">
                        {area.storageUnitsCount} storage units
                      </p>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
                          View Units
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
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