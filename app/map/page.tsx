'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface MapLocation {
  id: string
  name: string
  x: number
  y: number
  type: 'warehouse' | 'area' | 'storage-unit'
  itemsCount?: number
}

export default function MapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchMapData()
  }, [session, status, router])

  const fetchMapData = async () => {
    try {
      // Mock map data
      setLocations([
        { id: '1', name: 'Main Warehouse', x: 100, y: 80, type: 'warehouse', itemsCount: 247 },
        { id: '2', name: 'Zone A', x: 150, y: 120, type: 'area', itemsCount: 125 },
        { id: '3', name: 'Zone B', x: 250, y: 120, type: 'area', itemsCount: 85 },
        { id: '4', name: 'A-001', x: 180, y: 150, type: 'storage-unit', itemsCount: 45 },
        { id: '5', name: 'A-002', x: 220, y: 150, type: 'storage-unit', itemsCount: 32 },
        { id: '6', name: 'B-001', x: 280, y: 150, type: 'storage-unit', itemsCount: 28 }
      ])
    } catch (error) {
      console.error('Failed to fetch map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return '🏢'
      case 'area': return '📍'
      case 'storage-unit': return '📦'
      default: return '📍'
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'warehouse': return 'bg-blue-500 hover:bg-blue-600'
      case 'area': return 'bg-green-500 hover:bg-green-600'
      case 'storage-unit': return 'bg-purple-500 hover:bg-purple-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
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
            { label: 'Site Map' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🗺️ Site Map</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Interactive warehouse layout and item locations
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    📱 Generate QR Codes
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    ⚙️ Edit Layout
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading map...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interactive Map */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-100 rounded-lg p-4 h-96 relative border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Facility Layout</h3>
                      
                      {/* Map Canvas */}
                      <div className="relative w-full h-80 bg-white rounded border-2 border-dashed border-gray-300">
                        {locations.map((location) => (
                          <div
                            key={location.id}
                            className={`absolute w-8 h-8 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 text-white text-xs flex items-center justify-center transition-colors ${getLocationColor(location.type)}`}
                            style={{ left: `${location.x}px`, top: `${location.y}px` }}
                            onClick={() => setSelectedLocation(location)}
                            title={location.name}
                          >
                            {getLocationIcon(location.type)}
                          </div>
                        ))}
                        
                        {/* Legend */}
                        <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow text-xs">
                          <div className="font-semibold mb-1">Legend</div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span>Warehouse</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span>Area</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                            <span>Storage Unit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Details & QR Codes */}
                  <div className="space-y-4">
                    {selectedLocation ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {getLocationIcon(selectedLocation.type)} {selectedLocation.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>Type:</strong> {selectedLocation.type.replace('-', ' ').toUpperCase()}</p>
                          <p><strong>Items:</strong> {selectedLocation.itemsCount || 0}</p>
                          <p><strong>Coordinates:</strong> ({selectedLocation.x}, {selectedLocation.y})</p>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <button className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
                            📦 View Items
                          </button>
                          <button className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors">
                            📱 Generate QR Code
                          </button>
                          <button className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-sm hover:bg-purple-200 transition-colors">
                            📍 Navigate Here
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p className="text-gray-600">Click on any location in the map to view details</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Quick Actions</h3>
                      <div className="space-y-2">
                        <button className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
                          📄 Print Location Labels
                        </button>
                        <button className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors">
                          📱 Bulk Generate QR Codes
                        </button>
                        <button className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-sm hover:bg-purple-200 transition-colors">
                          📥 Import Layout
                        </button>
                        <button className="w-full bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md text-sm hover:bg-yellow-200 transition-colors">
                          📤 Export Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Features */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📱 QR Code Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-medium text-gray-900">Mobile Scanning</div>
                    <div className="text-xs text-gray-600 mt-1">Scan to view location details</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-sm font-medium text-gray-900">Quick Navigation</div>
                    <div className="text-xs text-gray-600 mt-1">Find items and locations fast</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-sm font-medium text-gray-900">Inventory Updates</div>
                    <div className="text-xs text-gray-600 mt-1">Update stock levels on-site</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm font-medium text-gray-900">Printable Labels</div>
                    <div className="text-xs text-gray-600 mt-1">Generate physical location tags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 