'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'
import { ItemForm } from '../components/forms/ItemForm'
import { MovementForm } from '../components/forms/MovementForm'

interface Item {
  id: string
  name: string
  sku?: string
  quantity: number
  price?: number
  condition: string
  storageUnitName: string
  areaName: string
  locationName: string
}

export default function ItemsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit' | 'move'>('view')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchItems()
  }, [session, status, router])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      } else {
        // Fallback mock data
        setItems([
          { id: '1', name: 'Widget A', sku: 'WID-001', quantity: 150, price: 29.99, condition: 'good', storageUnitName: 'A-001', areaName: 'Zone A', locationName: 'Main Warehouse' },
          { id: '2', name: 'Component B', sku: 'CMP-002', quantity: 8, price: 45.50, condition: 'good', storageUnitName: 'A-002', areaName: 'Zone A', locationName: 'Main Warehouse' },
          { id: '3', name: 'Part C', sku: 'PRT-003', quantity: 75, price: 12.25, condition: 'damaged', storageUnitName: 'B-001', areaName: 'Zone B', locationName: 'Main Warehouse' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteItem = async (item: Item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const response = await fetch(`/api/items?id=${item.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchItems() // Refresh items list
        } else {
          const errorData = await response.json()
          alert(`Failed to delete item: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item')
      }
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
            { label: 'Items' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🏷️ Items</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage individual inventory items
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('add')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add Item
                </button>
              </div>

              {activeTab === 'view' && (
                <>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search items by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {loading ? (
                    <div className="text-center py-4">Loading items...</div>
                  ) : (
                    <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.sku || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.quantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.price ? `$${item.price.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.condition === 'good' ? 'bg-green-100 text-green-800' :
                              item.condition === 'damaged' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{item.storageUnitName}</div>
                            <div className="text-xs text-gray-400">{item.areaName} • {item.locationName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedItem(item)
                                setActiveTab('edit')
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedItem(item)
                                setActiveTab('move')
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Move
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'add' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
                    <button
                      onClick={() => setActiveTab('view')}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Back to Items
                    </button>
                  </div>
                  <ItemForm
                    onSubmit={async (data) => {
                      try {
                        // Map form data to API format
                        const apiData = {
                          name: data.name,
                          description: data.description,
                          quantity: data.stockQuantity,
                          price: data.price,
                          sku: data.barcode, // Use barcode as SKU
                          storageUnitId: 'storage-unit-1' // TODO: Get this from storage unit selection
                        }
                        
                        const response = await fetch('/api/items', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(apiData),
                        })
                        
                        if (response.ok) {
                          await fetchItems() // Refresh items list
                          setActiveTab('view') // Return to items view
                        } else {
                          const errorData = await response.json()
                          throw new Error(errorData.error || 'Failed to create item')
                        }
                      } catch (error) {
                        console.error('Error creating item:', error)
                        throw error
                      }
                    }}
                    onCancel={() => setActiveTab('view')}
                  />
                </div>
              )}

              {activeTab === 'edit' && selectedItem && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Item: {selectedItem.name}</h2>
                    <button
                      onClick={() => {
                        setActiveTab('view')
                        setSelectedItem(null)
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Back to Items
                    </button>
                  </div>
                  <ItemForm
                    isEditing={true}
                    initialData={{
                      name: selectedItem.name,
                      description: '',
                      stockQuantity: selectedItem.quantity,
                      price: selectedItem.price || 0,
                      barcode: selectedItem.sku || '',
                      category: 'General',
                      supplier: 'Unknown',
                      location: {
                        warehouse: selectedItem.locationName || '',
                        zone: selectedItem.areaName || '',
                        aisle: selectedItem.storageUnitName || ''
                      }
                    }}
                    onSubmit={async (data) => {
                      try {
                        const apiData = {
                          id: selectedItem.id,
                          name: data.name,
                          description: data.description,
                          quantity: data.stockQuantity,
                          price: data.price,
                          sku: data.barcode
                        }
                        
                        const response = await fetch('/api/items', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(apiData),
                        })
                        
                        if (response.ok) {
                          await fetchItems()
                          setActiveTab('view')
                          setSelectedItem(null)
                        } else {
                          const errorData = await response.json()
                          throw new Error(errorData.error || 'Failed to update item')
                        }
                      } catch (error) {
                        console.error('Error updating item:', error)
                        throw error
                      }
                    }}
                    onCancel={() => {
                      setActiveTab('view')
                      setSelectedItem(null)
                    }}
                  />
                </div>
              )}

              {activeTab === 'move' && selectedItem && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Move Item: {selectedItem.name}</h2>
                    <button
                      onClick={() => {
                        setActiveTab('view')
                        setSelectedItem(null)
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Back to Items
                    </button>
                  </div>
                  <MovementForm
                    preselectedItemId={selectedItem.id}
                    onSubmit={async (data) => {
                      try {
                        const response = await fetch('/api/inventory-movements', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(data),
                        })
                        
                        if (response.ok) {
                          await fetchItems() // Refresh items to reflect movement
                          setActiveTab('view')
                          setSelectedItem(null)
                        } else {
                          const errorData = await response.json()
                          throw new Error(errorData.error || 'Failed to record movement')
                        }
                      } catch (error) {
                        console.error('Error recording movement:', error)
                        throw error
                      }
                    }}
                    onCancel={() => {
                      setActiveTab('view')
                      setSelectedItem(null)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 