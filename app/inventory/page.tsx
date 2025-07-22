'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useInventory } from '@/lib/contexts/InventoryContext'
import { ItemForm } from '@/app/components/forms/ItemForm'
import { MovementForm } from '@/app/components/forms/MovementForm'
import StockLevelIndicator from '@/app/components/StockLevelIndicator'
import NotificationBell from '@/app/components/NotificationBell'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  price: number
  sku: string
  description: string
  storageUnit?: {
    name: string
    areaName: string
    locationName: string
  }
  lastMovementDate?: Date
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, loading, error, refreshItems } = useInventory()
  const [activeTab, setActiveTab] = useState<'items' | 'add-item' | 'movements'>('items')
  const [apiItems, setApiItems] = useState<InventoryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoadingItems(true)
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const fetchedItems = await response.json()
        setApiItems(fetchedItems)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const filteredItems = apiItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLowStock = !showLowStockOnly || item.quantity <= 10
    
    return matchesSearch && matchesLowStock
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your inventory items and track movements
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Items ({apiItems.length})
              </button>
              {['ADMIN', 'MANAGER'].includes(session.user.role) && (
                <>
                  <button
                    onClick={() => setActiveTab('add-item')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'add-item'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ➕ Add Item
                  </button>
                  <button
                    onClick={() => setActiveTab('movements')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'movements'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🔄 Record Movement
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Items List */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search items by name, description, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLowStockOnly}
                      onChange={(e) => setShowLowStockOnly(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Show low stock only</span>
                  </label>
                </div>
                <button
                  onClick={fetchItems}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Items Grid */}
            {loadingItems ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">Loading items...</div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">
                  {searchTerm || showLowStockOnly ? 'No items match your criteria' : 'No items found'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <StockLevelIndicator
                        currentQuantity={item.quantity}
                        size="lg"
                        className="ml-2"
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">SKU:</span>
                        <span className="text-gray-900">{item.sku || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Price:</span>
                        <span className="text-gray-900">${item.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Quantity:</span>
                        <span className="font-bold text-gray-900">{item.quantity}</span>
                      </div>
                      {item.storageUnit && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-500">Location:</span>
                          <span className="text-gray-900 text-right">
                            {item.storageUnit.locationName}<br />
                            <span className="text-xs">
                              {item.storageUnit.areaName} - {item.storageUnit.name}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {(['ADMIN', 'MANAGER'].includes(session.user.role)) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setActiveTab('movements')}
                          className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Record Movement
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Item Form */}
        {activeTab === 'add-item' && (
          <div className="bg-white rounded-lg shadow">
            <ItemForm
              onSubmit={async (data) => {
                // The form will handle the API call
                await fetchItems() // Refresh items after adding
                setActiveTab('items') // Switch back to items view
              }}
              onCancel={() => setActiveTab('items')}
            />
          </div>
        )}

        {/* Movement Form */}
        {activeTab === 'movements' && (
          <div className="bg-white rounded-lg shadow">
            <MovementForm
              onSubmit={async (data) => {
                // The form will handle the API call
                await fetchItems() // Refresh items after movement
                setActiveTab('items') // Switch back to items view
              }}
              onCancel={() => setActiveTab('items')}
            />
          </div>
        )}
      </div>
    </div>
  )
} 