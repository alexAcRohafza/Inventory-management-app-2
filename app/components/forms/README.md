# Inventory Management Forms

This directory contains two main forms for managing inventory operations:

## ItemForm.tsx

A comprehensive form for adding and editing inventory items.

### Features:
- **Basic Information**: Name, barcode, stock quantity, price, category, supplier
- **Location Hierarchy**: Warehouse → Zone → Aisle → Shelf → Bin
- **Additional Details**: Description, stock levels, weight, dimensions
- **Form Validation**: Zod schema with TypeScript integration
- **API Integration**: Submits to `/api/items`

### Usage:

```tsx
import { ItemForm } from '@/app/components/forms'

// Add new item
function AddItemPage() {
  return (
    <ItemForm 
      onSubmit={async (data) => {
        console.log('New item:', data)
        // Custom submission logic
      }}
    />
  )
}

// Edit existing item
function EditItemPage({ item }) {
  return (
    <ItemForm 
      isEditing={true}
      initialData={item}
      onSubmit={async (data) => {
        console.log('Updated item:', data)
        // Custom update logic
      }}
      onCancel={() => router.back()}
    />
  )
}
```

## MovementForm.tsx

A smart form for recording inventory movements (stock in/out).

### Features:
- **Item Selection**: Dropdown with real-time stock display
- **Movement Types**: IN (purchases, returns) / OUT (sales, damages)
- **Smart Validation**: Prevents over-selling, validates stock levels
- **Context-Aware Fields**: Different fields based on movement type
- **Real-Time Calculations**: Shows stock after movement
- **API Integration**: Submits to `/api/inventory-movements`

### Usage:

```tsx
import { MovementForm } from '@/app/components/forms'

// General movement recording
function MovementPage() {
  return (
    <MovementForm 
      onSubmit={async (data) => {
        console.log('Movement recorded:', data)
        // Update inventory context
        await refreshInventory()
      }}
    />
  )
}

// Quick movement for specific item
function QuickMovementModal({ itemId, onClose }) {
  return (
    <MovementForm 
      preselectedItemId={itemId}
      onSubmit={async (data) => {
        console.log('Quick movement:', data)
        onClose()
      }}
      onCancel={onClose}
    />
  )
}
```

## API Endpoints Expected

The forms are designed to work with these API routes:

### GET /api/items
Returns array of inventory items:
```json
[
  {
    "id": "1",
    "name": "Item Name",
    "barcode": "123456789",
    "stockQuantity": 50,
    "location": {
      "warehouse": "A",
      "zone": "Z1",
      "aisle": "A1",
      "shelf": "S1",
      "bin": "B1"
    }
  }
]
```

### POST/PUT /api/items
Creates or updates inventory items

### POST /api/inventory-movements
Records inventory movements and updates stock levels

## Form Data Schemas

### ItemFormData
```typescript
interface ItemFormData {
  name: string
  barcode: string
  stockQuantity: number
  price: number
  category: string
  supplier: string
  location: {
    warehouse: string
    zone: string
    aisle?: string
    shelf?: string
    bin?: string
  }
  description?: string
  minStockLevel?: number
  maxStockLevel?: number
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: 'cm' | 'in' | 'm'
  }
}
```

### MovementFormData
```typescript
interface MovementFormData {
  itemId: string
  movementType: 'IN' | 'OUT'
  quantity: number
  reason: string
  reference?: string
  notes?: string
  location?: LocationHierarchy
  cost?: number
  supplier?: string
  recipient?: string
  expiryDate?: string
  batchNumber?: string
}
```

## Styling

Both forms use Tailwind CSS with a clean, professional design:
- Responsive grid layouts
- Focus states and validation styling  
- Loading states and error handling
- Accessible form labels and controls

## Integration with Context

The forms work seamlessly with your existing contexts:

```tsx
import { useInventory } from '@/lib/contexts/InventoryContext'
import { ItemForm, MovementForm } from '@/app/components/forms'

function InventoryManagement() {
  const { addItem, refreshItems } = useInventory()
  
  return (
    <div>
      <ItemForm onSubmit={addItem} />
      <MovementForm onSubmit={async (movement) => {
        // Record movement via API
        await fetch('/api/inventory-movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movement)
        })
        // Refresh inventory
        await refreshItems()
      }} />
    </div>
  )
}
``` 