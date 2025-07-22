'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface Movement {
  id: string
  itemName: string
  quantity: number
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'
  fromLocation?: string
  toLocation?: string
  notes?: string
  createdAt: string
}

export default function InventoryMovementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchMovements()
  }, [session, status, router])

  const fetchMovements = async () => {
    try {
      // Mock data for now
      setMovements([
        { 
          id: '1', 
          itemName: 'Widget A', 
          quantity: 50, 
          movementType: 'IN', 
          toLocation: 'A-001 • Zone A • Main Warehouse',
          notes: 'New shipment received',
          createdAt: new Date().toISOString()
        },
        { 
          id: '2', 
          itemName: 'Component B', 
          quantity: -25, 
          movementType: 'OUT', 
          fromLocation: 'A-002 • Zone A • Main Warehouse',
          notes: 'Sale to customer XYZ',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        { 
          id: '3', 
          itemName: 'Part C', 
          quantity: 10, 
          movementType: 'TRANSFER', 
          fromLocation: 'A-001 • Zone A',
          toLocation: 'B-001 • Zone B',
          notes: 'Inventory rebalancing',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to fetch movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800'
      case 'OUT':
        return 'bg-red-100 text-red-800'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800'
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return '📥'
      case 'OUT':
        return '📤'
      case 'TRANSFER':
        return '🔄'
      case 'ADJUSTMENT':
        return '⚖️'
      default:
        return '📦'
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
            { label: 'Inventory Movements' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🔄 Inventory Movements</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Track all inventory movements and transfers
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Record Movement
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading movements...</div>
              ) : (
                <div className="space-y-4">
                  {movements.map((movement) => (
                    <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getMovementIcon(movement.movementType)}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{movement.itemName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(movement.movementType)}`}>
                                {movement.movementType}
                              </span>
                              <span className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(movement.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(movement.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {(movement.fromLocation || movement.toLocation) && (
                        <div className="mt-3 text-sm text-gray-600">
                          {movement.fromLocation && (
                            <div>📤 From: {movement.fromLocation}</div>
                          )}
                          {movement.toLocation && (
                            <div>📥 To: {movement.toLocation}</div>
                          )}
                        </div>
                      )}

                      {movement.notes && (
                        <div className="mt-2 text-sm text-gray-500">
                          💬 {movement.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {movements.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔄</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No movements recorded</h3>
                      <p className="text-gray-600 mb-4">Start tracking inventory movements to see them here.</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        + Record First Movement
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerAndUp>
  )
} 