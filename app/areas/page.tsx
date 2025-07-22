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
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit' | 'units'>('view')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState({ name: '', locationId: '' })

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

  const handleViewUnits = (area: Area) => {
    setSelectedArea(area)
    setActiveTab('units')
  }

  const handleEditArea = (area: Area) => {
    setSelectedArea(area)
    setFormData({
      name: area.name,
      locationId: area.locationId
    })
    setActiveTab('edit')
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
                <button 
                  onClick={() => setActiveTab('add')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add Area
                </button>
              </div>

              {activeTab === 'view' && (
                <>
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
                            <button 
                              onClick={() => handleViewUnits(area)}
                              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                            >
                              View Units
                            </button>
                            <button 
                              onClick={() => handleEditArea(area)}
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'add' && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Add New Area</h3>
                      <button
                        onClick={() => setActiveTab('view')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      try {
                        // Mock API call - replace with real API
                        const newArea = {
                          id: Date.now().toString(),
                          name: formData.name,
                          locationId: formData.locationId,
                          locationName: 'Main Warehouse', // Mock location name
                          storageUnitsCount: 0
                        }
                        setAreas(prev => [...prev, newArea])
                        setFormData({ name: '', locationId: '' })
                        setActiveTab('view')
                        alert('Area added successfully!')
                      } catch (error) {
                        console.error('Error adding area:', error)
                        alert('Failed to add area')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Area Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Zone A, Cold Storage"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <select
                            required
                            value={formData.locationId}
                            onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a location...</option>
                            <option value="1">Main Warehouse</option>
                            <option value="2">Storage Facility B</option>
                            <option value="3">Distribution Center</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Add Area
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ name: '', locationId: '' })
                              setActiveTab('view')
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'edit' && selectedArea && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Edit Area: {selectedArea.name}</h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedArea(null)
                          setFormData({ name: '', locationId: '' })
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Areas
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      try {
                        // Update the area in the list
                        setAreas(prev => prev.map(area => 
                          area.id === selectedArea.id 
                            ? { ...area, name: formData.name, locationId: formData.locationId, locationName: 'Updated Location' }
                            : area
                        ))
                        setActiveTab('view')
                        setSelectedArea(null)
                        setFormData({ name: '', locationId: '' })
                        alert('Area updated successfully!')
                      } catch (error) {
                        console.error('Error updating area:', error)
                        alert('Failed to update area')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Area Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Zone A, Cold Storage"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <select
                            required
                            value={formData.locationId}
                            onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a location...</option>
                            <option value="1">Main Warehouse</option>
                            <option value="2">Storage Facility B</option>
                            <option value="3">Distribution Center</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Update Area
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('view')
                              setSelectedArea(null)
                              setFormData({ name: '', locationId: '' })
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'units' && selectedArea && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Storage Units in: {selectedArea.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedArea(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Areas
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Mock storage units for this area */}
                      {Array.from({ length: selectedArea.storageUnitsCount || 6 }, (_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{selectedArea.name}-{(i + 1).toString().padStart(3, '0')}</h4>
                            <span className="text-xl">📦</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">📍 {selectedArea.name}</p>
                          <p className="text-xs text-gray-500 mb-3">🏢 {selectedArea.locationName}</p>
                          <p className="text-sm text-blue-600 mb-3">
                            {Math.floor(Math.random() * 50) + 10} items stored
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
                    
                    {selectedArea.storageUnitsCount === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📦</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No storage units configured</h4>
                        <p className="text-gray-600 mb-4">This area doesn't have any storage units set up yet.</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Add First Storage Unit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 