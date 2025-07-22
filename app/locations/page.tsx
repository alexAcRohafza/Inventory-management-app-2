'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface Location {
  id: string
  name: string
  address: string
  areasCount?: number
}

export default function LocationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchLocations()
  }, [session, status, router])

  const fetchLocations = async () => {
    try {
      // Mock data for now - replace with actual API call
      setLocations([
        { id: '1', name: 'Main Warehouse', address: '123 Industrial Ave', areasCount: 5 },
        { id: '2', name: 'Storage Facility B', address: '456 Storage St', areasCount: 3 },
        { id: '3', name: 'Distribution Center', address: '789 Logistics Blvd', areasCount: 8 }
      ])
    } catch (error) {
      console.error('Failed to fetch locations:', error)
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
            { label: 'Locations' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🏢 Locations</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage warehouse locations and facilities
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Add Location
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading locations...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.map((location) => (
                    <div key={location.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                        <span className="text-2xl">🏢</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📍 {location.address}</p>
                      <p className="text-sm text-blue-600 mb-4">
                        {location.areasCount} areas configured
                      </p>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
                          View Areas
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && locations.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first warehouse location.</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    + Add First Location
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 