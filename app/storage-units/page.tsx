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
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit' | 'items'>('view')
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null)
  const [formData, setFormData] = useState({ name: '', areaId: '' })

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

  const handleViewItems = (unit: StorageUnit) => {
    setSelectedUnit(unit)
    setActiveTab('items')
  }

  const handleEditUnit = (unit: StorageUnit) => {
    setSelectedUnit(unit)
    setFormData({
      name: unit.name,
      areaId: unit.areaId
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
                <button 
                  onClick={() => setActiveTab('add')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add Storage Unit
                </button>
              </div>

              {activeTab === 'view' && (
                <>
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
                            <button 
                              onClick={() => handleViewItems(unit)}
                              className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                            >
                              View Items
                            </button>
                            <button 
                              onClick={() => handleEditUnit(unit)}
                              className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
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
                      <h3 className="text-lg font-semibold text-gray-900">Add New Storage Unit</h3>
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
                        const newUnit = {
                          id: Date.now().toString(),
                          name: formData.name,
                          areaId: formData.areaId,
                          areaName: 'Zone A', // Mock area name
                          locationName: 'Main Warehouse', // Mock location name
                          itemsCount: 0
                        }
                        setUnits(prev => [...prev, newUnit])
                        setFormData({ name: '', areaId: '' })
                        setActiveTab('view')
                        alert('Storage unit added successfully!')
                      } catch (error) {
                        console.error('Error adding storage unit:', error)
                        alert('Failed to add storage unit')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., A-001, Shelf-B-12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Area *
                          </label>
                          <select
                            required
                            value={formData.areaId}
                            onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select an area...</option>
                            <option value="1">Zone A</option>
                            <option value="2">Zone B</option>
                            <option value="3">Cold Storage</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Add Storage Unit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ name: '', areaId: '' })
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

              {activeTab === 'edit' && selectedUnit && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Edit Storage Unit: {selectedUnit.name}</h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedUnit(null)
                          setFormData({ name: '', areaId: '' })
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Storage Units
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      try {
                        // Update the storage unit in the list
                        setUnits(prev => prev.map(unit => 
                          unit.id === selectedUnit.id 
                            ? { ...unit, name: formData.name, areaId: formData.areaId, areaName: 'Updated Area' }
                            : unit
                        ))
                        setActiveTab('view')
                        setSelectedUnit(null)
                        setFormData({ name: '', areaId: '' })
                        alert('Storage unit updated successfully!')
                      } catch (error) {
                        console.error('Error updating storage unit:', error)
                        alert('Failed to update storage unit')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., A-001, Shelf-B-12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Area *
                          </label>
                          <select
                            required
                            value={formData.areaId}
                            onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select an area...</option>
                            <option value="1">Zone A</option>
                            <option value="2">Zone B</option>
                            <option value="3">Cold Storage</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Update Storage Unit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('view')
                              setSelectedUnit(null)
                              setFormData({ name: '', areaId: '' })
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

              {activeTab === 'items' && selectedUnit && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Items in: {selectedUnit.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedUnit(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Storage Units
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Mock items for this storage unit */}
                          {Array.from({ length: selectedUnit.itemsCount || 5 }, (_, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">Item {i + 1}</div>
                                <div className="text-sm text-gray-500">Description for item {i + 1}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {selectedUnit.name}-ITM-{(i + 1).toString().padStart(3, '0')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {Math.floor(Math.random() * 100) + 10}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${(Math.random() * 100 + 10).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                <button className="text-green-600 hover:text-green-900">Move</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {selectedUnit.itemsCount === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📦</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No items stored</h4>
                        <p className="text-gray-600 mb-4">This storage unit doesn't have any items yet.</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Add First Item
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