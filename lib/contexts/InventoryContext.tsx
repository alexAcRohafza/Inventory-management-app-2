'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { InventoryItem } from '@/types'
import NotificationService from '@/lib/notification-service'
import { useSession } from 'next-auth/react'

interface InventoryContextType {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refreshItems: () => Promise<void>
  autoRefreshEnabled: boolean
  setAutoRefreshEnabled: (enabled: boolean) => void
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds default
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { data: session } = useSession()

  const addItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          description: item.category, // Map category to description for now
          quantity: item.quantity,
          price: item.price,
          sku: item.supplier, // Map supplier to SKU for now - this is a temporary mapping
          storageUnitId: 'unit-1' // Use default storage unit from seed data
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add item')
      }

      const result = await response.json()
      
      // Create notification for item added
      if (session?.user?.email) {
        await NotificationService.notifyItemAdded(session.user.email, item.name)
      }
      
      // Trigger immediate refresh after add
      await refreshItems()
    } catch (err: any) {
      setError(err.message || 'Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    setLoading(true)
    setError(null)
    try {
      const currentItem = items.find(item => item.id === id)
      
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name: updates.name,
          description: updates.category,
          quantity: updates.quantity,
          price: updates.price,
          sku: updates.supplier
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update item')
      }
      
      // Create notifications for stock changes
      if (session?.user?.email && currentItem && updates.quantity !== undefined) {
        await NotificationService.notifyStockUpdated(
          session.user.email,
          currentItem.name,
          currentItem.quantity,
          updates.quantity
        )
        
        // Check for low stock
        const LOW_STOCK_THRESHOLD = 10 // This could be configurable
        if (updates.quantity <= LOW_STOCK_THRESHOLD) {
          await NotificationService.notifyLowStock(
            session.user.email,
            currentItem.name,
            updates.quantity,
            LOW_STOCK_THRESHOLD
          )
        }
      }
      
      // Trigger immediate refresh after update
      await refreshItems()
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete item')
      }
      
      // Trigger immediate refresh after delete
      await refreshItems()
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    } finally {
      setLoading(false)
    }
  }

  const refreshItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/items')
      
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      
      const fetchedItems = await response.json()
      
      // Transform API response to match InventoryItem interface
      const transformedItems = fetchedItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || item.stockQuantity,
        price: item.price || 0,
        category: item.description || item.category || 'General',
        supplier: item.sku || item.supplier || 'Unknown',
        lastUpdated: new Date(item.updatedAt || item.createdAt)
      }))
      
      setItems(transformedItems)
    } catch (err: any) {
      setError(err.message || 'Failed to refresh items')
      console.error('Failed to refresh inventory items:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefreshEnabled && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshItems()
      }, refreshInterval)
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefreshEnabled, refreshInterval])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  const value: InventoryContextType = {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshInterval,
    setRefreshInterval
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
} 