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
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit' | 'areas'>('view')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '' })

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

  const handleViewAreas = (location: Location) => {
    setSelectedLocation(location)
    setActiveTab('areas')
  }

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location)
    setFormData({
      name: location.name,
      address: location.address
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
                <button 
                  onClick={() => setActiveTab('add')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add Location
                </button>
              </div>

              {activeTab === 'view' && (
                <>
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
                        <button 
                          onClick={() => handleViewAreas(location)}
                          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Areas
                        </button>
                        <button 
                          onClick={() => handleEditLocation(location)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                        >
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
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Add First Location
                  </button>
                </div>
              )}
                </>
              )}

              {activeTab === 'add' && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Add New Location</h3>
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
                        const newLocation = {
                          id: Date.now().toString(),
                          name: formData.name,
                          address: formData.address,
                          areasCount: 0
                        }
                        setLocations(prev => [...prev, newLocation])
                        setFormData({ name: '', address: '' })
                        setActiveTab('view')
                        alert('Location added successfully!')
                      } catch (error) {
                        console.error('Error adding location:', error)
                        alert('Failed to add location')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Main Warehouse"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 123 Industrial Ave, City, State 12345"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Add Location
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ name: '', address: '' })
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

              {activeTab === 'edit' && selectedLocation && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Edit Location: {selectedLocation.name}</h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedLocation(null)
                          setFormData({ name: '', address: '' })
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Locations
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      try {
                        // Update the location in the list
                        setLocations(prev => prev.map(loc => 
                          loc.id === selectedLocation.id 
                            ? { ...loc, name: formData.name, address: formData.address }
                            : loc
                        ))
                        setActiveTab('view')
                        setSelectedLocation(null)
                        setFormData({ name: '', address: '' })
                        alert('Location updated successfully!')
                      } catch (error) {
                        console.error('Error updating location:', error)
                        alert('Failed to update location')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Main Warehouse"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 123 Industrial Ave, City, State 12345"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Update Location
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('view')
                              setSelectedLocation(null)
                              setFormData({ name: '', address: '' })
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

              {activeTab === 'areas' && selectedLocation && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Areas in: {selectedLocation.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedLocation(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Locations
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mock areas for this location */}
                      {Array.from({ length: selectedLocation.areasCount || 3 }, (_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">Area {String.fromCharCode(65 + i)}</h4>
                            <span className="text-xl">📍</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">🏢 {selectedLocation.name}</p>
                          <p className="text-sm text-blue-600 mb-3">
                            {Math.floor(Math.random() * 10) + 5} storage units
                          </p>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                              View Units
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
                              Edit Area
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedLocation.areasCount === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📍</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No areas configured</h4>
                        <p className="text-gray-600 mb-4">This location doesn't have any areas set up yet.</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Add First Area
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