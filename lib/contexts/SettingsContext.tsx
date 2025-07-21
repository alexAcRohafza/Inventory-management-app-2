'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface AppSettings {
  theme: 'light' | 'dark'
  currency: string
  lowStockThreshold: number
  notifications: {
    lowStock: boolean
    orderUpdates: boolean
    systemUpdates: boolean
  }
  language: string
  dateFormat: string
  timezone: string
}

interface SettingsContextType {
  settings: AppSettings
  loading: boolean
  error: string | null
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}

const defaultSettings: AppSettings = {
  theme: 'light',
  currency: 'USD',
  lowStockThreshold: 10,
  notifications: {
    lowStock: true,
    orderUpdates: true,
    systemUpdates: false
  },
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timezone: 'UTC'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }, [])

  const updateSettings = async (updates: Partial<AppSettings>) => {
    setLoading(true)
    setError(null)
    try {
      const newSettings = { ...settings, ...updates }
      
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(newSettings))
      
      // TODO: Implement API call to save settings to backend
      setSettings(newSettings)
      
    } catch (err) {
      setError('Failed to update settings')
      console.error('Settings update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      // Clear localStorage
      localStorage.removeItem('appSettings')
      
      // TODO: Implement API call to reset settings on backend
      setSettings(defaultSettings)
      
    } catch (err) {
      setError('Failed to reset settings')
      console.error('Settings reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 