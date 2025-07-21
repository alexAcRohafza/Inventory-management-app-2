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
      // TODO: Implement API call to add item
      const newItem: InventoryItem = {
        ...item,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      setItems(prev => [...prev, newItem])
      
      // Create notification for item added
      if (session?.user?.email) {
        await NotificationService.notifyItemAdded(session.user.email, item.name)
      }
      
      // Trigger immediate refresh after add
      if (autoRefreshEnabled) {
        await refreshItems()
      }
    } catch (err) {
      setError('Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    setLoading(true)
    setError(null)
    try {
      const currentItem = items.find(item => item.id === id)
      
      // TODO: Implement API call to update item
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updates, lastUpdated: new Date() }
            : item
        )
      )
      
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
      if (autoRefreshEnabled) {
        await refreshItems()
      }
    } catch (err) {
      setError('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Implement API call to delete item
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError('Failed to delete item')
    } finally {
      setLoading(false)
    }
  }

  const refreshItems = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Implement API call to fetch items
      // For now, keeping existing items but simulating a refresh
      console.log('Refreshing inventory items...')
    } catch (err) {
      setError('Failed to refresh items')
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