'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
  supplier: string
  lastUpdated: Date
}

interface InventoryContextType {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refreshItems: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      // TODO: Implement API call to update item
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updates, lastUpdated: new Date() }
            : item
        )
      )
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
      // For now, keeping existing items
    } catch (err) {
      setError('Failed to refresh items')
    } finally {
      setLoading(false)
    }
  }

  const value: InventoryContextType = {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems
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