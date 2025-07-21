'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'

const movementFormSchema = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  movementType: z.enum(['IN', 'OUT']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  location: z.object({
    warehouse: z.string().min(1, 'Warehouse is required'),
    zone: z.string().min(1, 'Zone is required'),
    aisle: z.string().optional(),
    shelf: z.string().optional(),
    bin: z.string().optional()
  }).optional(),
  cost: z.number().min(0, 'Cost must be 0 or greater').optional(),
  supplier: z.string().optional(),
  recipient: z.string().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional()
})

type MovementFormData = z.infer<typeof movementFormSchema>

interface InventoryItem {
  id: string
  name: string
  barcode: string
  stockQuantity: number
  location: {
    warehouse: string
    zone: string
    aisle?: string
    shelf?: string
    bin?: string
  }
}

interface MovementFormProps {
  onSubmit?: (data: MovementFormData) => Promise<void>
  onCancel?: () => void
  preselectedItemId?: string
}

const movementReasons = {
  IN: [
    'Purchase',
    'Return',
    'Transfer In',
    'Production',
    'Adjustment',
    'Initial Stock',
    'Other'
  ],
  OUT: [
    'Sale',
    'Transfer Out',
    'Damage',
    'Expiry',
    'Theft',
    'Production Use',
    'Sample',
    'Adjustment',
    'Other'
  ]
}

export function MovementForm({ onSubmit, onCancel, preselectedItemId }: MovementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      itemId: preselectedItemId || '',
      movementType: 'IN',
      quantity: 1,
      reason: '',
      reference: '',
      notes: '',
      cost: 0,
      supplier: '',
      recipient: '',
      expiryDate: '',
      batchNumber: ''
    }
  })

  const movementType = watch('movementType')
  const itemId = watch('itemId')
  const quantity = watch('quantity')

  // Load items on component mount
  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true)
      try {
        const response = await fetch('/api/items')
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (err) {
        console.error('Failed to load items:', err)
      } finally {
        setLoadingItems(false)
      }
    }

    loadItems()
  }, [])

  // Update selected item when itemId changes
  useEffect(() => {
    const item = items.find(i => i.id === itemId)
    setSelectedItem(item || null)
    
    // Auto-fill location for IN movements
    if (item && movementType === 'IN') {
      setValue('location', item.location)
    }
  }, [itemId, items, movementType, setValue])

  const handleFormSubmit = async (data: MovementFormData) => {
    // Validate OUT movement doesn't exceed stock
    if (data.movementType === 'OUT' && selectedItem) {
      if (data.quantity > selectedItem.stockQuantity) {
        setError(`Cannot remove ${data.quantity} items. Only ${selectedItem.stockQuantity} in stock.`)
        return
      }
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default API call
        const response = await fetch('/api/inventory-movements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to record movement')
        }

        reset()
        setSelectedItem(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableReasons = movementReasons[movementType] || []

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Record Inventory Movement</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Item Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Item *
            </label>
            <select
              {...register('itemId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingItems}
            >
              <option value="">
                {loadingItems ? 'Loading items...' : 'Select an item'}
              </option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stock: {item.stockQuantity}) - {item.barcode}
                </option>
              ))}
            </select>
            {errors.itemId && (
              <p className="text-red-500 text-sm mt-1">{errors.itemId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Type *
            </label>
            <Controller
              name="movementType"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="IN"
                      checked={field.value === 'IN'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-green-600 font-medium">Stock IN</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="OUT"
                      checked={field.value === 'OUT'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-red-600 font-medium">Stock OUT</span>
                  </label>
                </div>
              )}
            />
            {errors.movementType && (
              <p className="text-red-500 text-sm mt-1">{errors.movementType.message}</p>
            )}
          </div>
        </div>

        {/* Item Information Display */}
        {selectedItem && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Selected Item Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="font-medium">Current Stock:</span>
                <span className={`ml-2 ${selectedItem.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedItem.stockQuantity}
                </span>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <span className="ml-2">{selectedItem.location.warehouse}-{selectedItem.location.zone}</span>
              </div>
              <div>
                <span className="font-medium">Barcode:</span>
                <span className="ml-2">{selectedItem.barcode}</span>
              </div>
              {movementType === 'OUT' && (
                <div>
                  <span className="font-medium">After Movement:</span>
                  <span className={`ml-2 ${(selectedItem.stockQuantity - quantity) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {selectedItem.stockQuantity - quantity}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movement Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
              min="1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              {...register('reason')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select reason</option>
              {availableReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              {...register('reference')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PO#, Invoice#, etc."
            />
          </div>

          {movementType === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Unit
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movementType === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                {...register('supplier')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Supplier name"
              />
            </div>
          )}

          {movementType === 'OUT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <input
                type="text"
                {...register('recipient')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer, department, etc."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Number
            </label>
            <input
              type="text"
              {...register('batchNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Batch/Lot number"
            />
          </div>

          {movementType === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                {...register('expiryDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Custom Location for IN movements */}
        {movementType === 'IN' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Storage Location (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <input
                  type="text"
                  {...register('location.warehouse')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A, B, C..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <input
                  type="text"
                  {...register('location.zone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Z1, Z2, Z3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aisle
                </label>
                <input
                  type="text"
                  {...register('location.aisle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A1, A2..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf
                </label>
                <input
                  type="text"
                  {...register('location.shelf')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="S1, S2..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bin
                </label>
                <input
                  type="text"
                  {...register('location.bin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="B1, B2..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this movement..."
          />
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex gap-4 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !selectedItem}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
          >
            {isSubmitting ? 'Recording...' : 'Record Movement'}
          </button>
        </div>
      </form>
    </div>
  )
} 