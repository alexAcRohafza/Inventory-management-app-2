'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const itemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Name too long'),
  barcode: z.string().min(1, 'Barcode is required'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be 0 or greater'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  category: z.string().min(1, 'Category is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  location: z.object({
    warehouse: z.string().min(1, 'Warehouse is required'),
    zone: z.string().min(1, 'Zone is required'),
    aisle: z.string().optional(),
    shelf: z.string().optional(),
    bin: z.string().optional()
  }),
  description: z.string().optional(),
  minStockLevel: z.number().int().min(0, 'Min stock level must be 0 or greater').optional(),
  maxStockLevel: z.number().int().min(0, 'Max stock level must be 0 or greater').optional(),
  weight: z.number().min(0, 'Weight must be 0 or greater').optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(['cm', 'in', 'm']).optional()
  }).optional()
})

type ItemFormData = z.infer<typeof itemFormSchema>

interface ItemFormProps {
  initialData?: Partial<ItemFormData>
  onSubmit?: (data: ItemFormData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
}

export function ItemForm({ initialData, onSubmit, onCancel, isEditing = false }: ItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      barcode: initialData?.barcode || '',
      stockQuantity: initialData?.stockQuantity || 0,
      price: initialData?.price || 0,
      category: initialData?.category || '',
      supplier: initialData?.supplier || '',
      location: {
        warehouse: initialData?.location?.warehouse || '',
        zone: initialData?.location?.zone || '',
        aisle: initialData?.location?.aisle || '',
        shelf: initialData?.location?.shelf || '',
        bin: initialData?.location?.bin || ''
      },
      description: initialData?.description || '',
      minStockLevel: initialData?.minStockLevel || 10,
      maxStockLevel: initialData?.maxStockLevel || 100,
      weight: initialData?.weight || 0,
      dimensions: {
        length: initialData?.dimensions?.length || 0,
        width: initialData?.dimensions?.width || 0,
        height: initialData?.dimensions?.height || 0,
        unit: initialData?.dimensions?.unit || 'cm'
      }
    }
  })

  const handleFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default API call
        const response = await fetch('/api/items', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to save item')
        }

        reset()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Item' : 'Add New Item'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter item name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode *
            </label>
            <input
              type="text"
              {...register('barcode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter barcode"
            />
            {errors.barcode && (
              <p className="text-red-500 text-sm mt-1">{errors.barcode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              {...register('stockQuantity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
            {errors.stockQuantity && (
              <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Automotive">Automotive</option>
              <option value="Sports & Recreation">Sports & Recreation</option>
              <option value="Books & Media">Books & Media</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier *
            </label>
            <input
              type="text"
              {...register('supplier')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter supplier name"
            />
            {errors.supplier && (
              <p className="text-red-500 text-sm mt-1">{errors.supplier.message}</p>
            )}
          </div>
        </div>

        {/* Location Hierarchy */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse *
              </label>
              <input
                type="text"
                {...register('location.warehouse')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="A, B, C..."
              />
              {errors.location?.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.location.warehouse.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone *
              </label>
              <input
                type="text"
                {...register('location.zone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Z1, Z2, Z3..."
              />
              {errors.location?.zone && (
                <p className="text-red-500 text-sm mt-1">{errors.location.zone.message}</p>
              )}
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

        {/* Additional Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Item description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Stock Level
              </label>
              <input
                type="number"
                {...register('minStockLevel', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stock Level
              </label>
              <input
                type="number"
                {...register('maxStockLevel', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('weight', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  {...register('dimensions.length', { valueAsNumber: true })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="L"
                  min="0"
                />
                <input
                  type="number"
                  step="0.01"
                  {...register('dimensions.width', { valueAsNumber: true })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="W"
                  min="0"
                />
                <input
                  type="number"
                  step="0.01"
                  {...register('dimensions.height', { valueAsNumber: true })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="H"
                  min="0"
                />
                <select
                  {...register('dimensions.unit')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>
          </div>
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
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  )
} 