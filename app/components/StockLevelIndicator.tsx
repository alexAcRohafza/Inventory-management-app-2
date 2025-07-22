'use client'

import { useSettings } from '@/lib/contexts/SettingsContext'

interface StockLevelIndicatorProps {
  currentQuantity: number
  minStockLevel?: number
  maxStockLevel?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StockLevelIndicator({ 
  currentQuantity, 
  minStockLevel,
  maxStockLevel,
  className = '',
  showLabel = true,
  size = 'md'
}: StockLevelIndicatorProps) {
  const { settings } = useSettings()
  
  // Use component props or fall back to settings
  const lowStockThreshold = minStockLevel || settings.lowStockThreshold || 10
  const highStockThreshold = maxStockLevel || (lowStockThreshold * 10) || 100

  // Determine stock level status
  const getStockStatus = () => {
    if (currentQuantity <= 0) {
      return {
        status: 'out-of-stock',
        color: 'bg-red-600',
        textColor: 'text-red-600',
        label: 'Out of Stock',
        icon: '❌'
      }
    } else if (currentQuantity <= lowStockThreshold) {
      return {
        status: 'low-stock',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        label: 'Low Stock',
        icon: '⚠️'
      }
    } else if (currentQuantity >= highStockThreshold) {
      return {
        status: 'high-stock',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        label: 'High Stock',
        icon: '📦'
      }
    } else {
      return {
        status: 'normal-stock',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        label: 'Normal Stock',
        icon: '✅'
      }
    }
  }

  const stockStatus = getStockStatus()

  // Size configurations
  const sizeConfig = {
    sm: {
      indicator: 'w-2 h-2',
      text: 'text-xs',
      container: 'gap-1'
    },
    md: {
      indicator: 'w-3 h-3',
      text: 'text-sm',
      container: 'gap-2'
    },
    lg: {
      indicator: 'w-4 h-4',
      text: 'text-base',
      container: 'gap-3'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={`flex items-center ${config.container} ${className}`}>
      {/* Color indicator dot */}
      <div 
        className={`${config.indicator} rounded-full ${stockStatus.color}`}
        title={stockStatus.label}
      />
      
      {/* Stock quantity */}
      <span className={`font-medium ${stockStatus.textColor} ${config.text}`}>
        {currentQuantity}
      </span>
      
      {/* Optional label */}
      {showLabel && (
        <span className={`${stockStatus.textColor} ${config.text}`}>
          {stockStatus.label}
        </span>
      )}
      
      {/* Optional icon for better visual indication */}
      {size !== 'sm' && (
        <span className="text-xs" title={stockStatus.label}>
          {stockStatus.icon}
        </span>
      )}
    </div>
  )
}

// Additional utility component for stock level bars
export function StockLevelBar({ 
  currentQuantity, 
  minStockLevel, 
  maxStockLevel,
  className = ''
}: Omit<StockLevelIndicatorProps, 'showLabel' | 'size'>) {
  const { settings } = useSettings()
  
  const lowThreshold = minStockLevel || settings.lowStockThreshold || 10
  const highThreshold = maxStockLevel || (lowThreshold * 10) || 100
  
  // Calculate percentage of current stock relative to max threshold
  const percentage = Math.min((currentQuantity / highThreshold) * 100, 100)
  
  // Determine bar color based on thresholds
  let barColor = 'bg-green-500'
  if (currentQuantity <= 0) {
    barColor = 'bg-red-600'
  } else if (currentQuantity <= lowThreshold) {
    barColor = 'bg-yellow-500'
  } else if (currentQuantity >= highThreshold) {
    barColor = 'bg-blue-500'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Stock: {currentQuantity}</span>
        <span>Target: {highThreshold}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low: {lowThreshold}</span>
        <span>High: {highThreshold}</span>
      </div>
    </div>
  )
}

// Utility function to get stock status
export function getStockStatus(
  currentQuantity: number, 
  lowThreshold: number = 10, 
  highThreshold?: number
) {
  if (currentQuantity <= 0) return 'out-of-stock'
  if (currentQuantity <= lowThreshold) return 'low-stock'
  if (highThreshold && currentQuantity >= highThreshold) return 'high-stock'
  return 'normal-stock'
} 