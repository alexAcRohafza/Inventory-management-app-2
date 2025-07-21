import Papa from 'papaparse'
import { prisma } from './prisma'

export interface CSVItem {
  name: string
  description?: string
  quantity: number
  price?: number
  sku?: string
  storageUnitId: string
  locationName?: string
  areaName?: string
  storageUnitName?: string
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
  value?: any
}

export interface CSVParseResult {
  data: CSVItem[]
  errors: CSVValidationError[]
  totalRows: number
  validRows: number
}

export interface ReportFilter {
  locationId?: string
  areaId?: string
  storageUnitId?: string
  lowStockThreshold?: number
  dateFrom?: Date
  dateTo?: Date
  category?: string
}

export interface ItemReport {
  id: string
  name: string
  description?: string
  quantity: number
  price?: number
  sku?: string
  locationName: string
  areaName: string
  storageUnitName: string
  lastMovementDate?: Date
  isLowStock: boolean
}

// Parse CSV string into structured data
export function parseCSV(csvContent: string): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const errors: CSVValidationError[] = []
    const validData: CSVItem[] = []

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      step: (result: any, parser: any) => {
        const rowIndex = parser.getCharIndex()
        const data = result.data

        // Validate required fields
        const requiredFields = ['name', 'quantity', 'storageunitname']
        const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '')

        if (missingFields.length > 0) {
          errors.push({
            row: rowIndex,
            field: missingFields.join(', '),
            message: `Missing required field(s): ${missingFields.join(', ')}`,
          })
          return
        }

        // Validate quantity is a number
        const quantity = parseInt(data.quantity)
        if (isNaN(quantity) || quantity < 0) {
          errors.push({
            row: rowIndex,
            field: 'quantity',
            message: 'Quantity must be a valid non-negative number',
            value: data.quantity
          })
          return
        }

        // Validate price if provided
        let price: number | undefined
        if (data.price && data.price.toString().trim() !== '') {
          price = parseFloat(data.price)
          if (isNaN(price) || price < 0) {
            errors.push({
              row: rowIndex,
              field: 'price',
              message: 'Price must be a valid non-negative number',
              value: data.price
            })
            return
          }
        }

        // Create valid item object
        const item: CSVItem = {
          name: data.name.toString().trim(),
          description: data.description?.toString().trim() || undefined,
          quantity,
          price,
          sku: data.sku?.toString().trim() || undefined,
          storageUnitId: '', // Will be resolved later
          locationName: data.locationname?.toString().trim(),
          areaName: data.areaname?.toString().trim(),
          storageUnitName: data.storageunitname.toString().trim()
        }

        validData.push(item)
      },
      complete: () => {
        resolve({
          data: validData,
          errors,
          totalRows: validData.length + errors.length,
          validRows: validData.length
        })
      },
      error: (error: any) => {
        resolve({
          data: [],
          errors: [{
            row: 0,
            field: 'file',
            message: `CSV parsing error: ${error.message}`
          }],
          totalRows: 0,
          validRows: 0
        })
      }
    })
  })
}

// Resolve storage unit IDs from names
export async function resolveStorageUnits(items: CSVItem[]): Promise<CSVItem[]> {
  const resolvedItems: CSVItem[] = []

  for (const item of items) {
    try {
      // Find storage unit by name, optionally filtered by location and area
      const whereCondition: any = {
        name: item.storageUnitName
      }

      if (item.locationName && item.areaName) {
        whereCondition.area = {
          name: item.areaName,
          location: {
            name: item.locationName
          }
        }
      } else if (item.areaName) {
        whereCondition.area = {
          name: item.areaName
        }
      }

      const storageUnit = await prisma.storageUnit.findFirst({
        where: whereCondition,
        include: {
          area: {
            include: {
              location: true
            }
          }
        }
      })

      if (storageUnit) {
        resolvedItems.push({
          ...item,
          storageUnitId: storageUnit.id
        })
      } else {
        // If storage unit not found, we'll handle this in the import process
        resolvedItems.push(item)
      }
    } catch (error) {
      // If resolution fails, add the item as-is for error handling
      resolvedItems.push(item)
    }
  }

  return resolvedItems
}

// Import validated CSV items into database
export async function importCSVItems(items: CSVItem[]): Promise<{
  imported: number
  errors: CSVValidationError[]
}> {
  const errors: CSVValidationError[] = []
  let imported = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    try {
      // Check if storage unit exists
      if (!item.storageUnitId) {
        errors.push({
          row: i + 1,
          field: 'storageUnitName',
          message: `Storage unit '${item.storageUnitName}' not found`,
          value: item.storageUnitName
        })
        continue
      }

      // Check if item with same SKU already exists (if SKU provided)
      if (item.sku) {
        const existing = await prisma.item.findUnique({
          where: { sku: item.sku }
        })

        if (existing) {
          errors.push({
            row: i + 1,
            field: 'sku',
            message: `Item with SKU '${item.sku}' already exists`,
            value: item.sku
          })
          continue
        }
      }

      // Create the item
      await prisma.item.create({
        data: {
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku,
          storageUnitId: item.storageUnitId
        }
      })

      imported++
    } catch (error: any) {
      errors.push({
        row: i + 1,
        field: 'database',
        message: `Failed to import: ${error.message}`,
      })
    }
  }

  return { imported, errors }
}

// Generate CSV export data
export async function generateItemsCSV(filters: ReportFilter = {}): Promise<string> {
  const items = await getItemsForReport(filters)
  
  const csvData = items.map(item => ({
    Name: item.name,
    Description: item.description || '',
    Quantity: item.quantity,
    Price: item.price || '',
    SKU: item.sku || '',
    Location: item.locationName,
    Area: item.areaName,
    'Storage Unit': item.storageUnitName,
    'Last Movement': item.lastMovementDate ? item.lastMovementDate.toISOString().split('T')[0] : '',
    'Low Stock': item.isLowStock ? 'Yes' : 'No'
  }))

  return Papa.unparse(csvData)
}

// Get items for reporting with filters
export async function getItemsForReport(filters: ReportFilter = {}): Promise<ItemReport[]> {
  const whereCondition: any = {}

  // Apply location filter
  if (filters.locationId) {
    whereCondition.storageUnit = {
      area: {
        locationId: filters.locationId
      }
    }
  }

  // Apply area filter
  if (filters.areaId) {
    whereCondition.storageUnit = {
      ...whereCondition.storageUnit,
      areaId: filters.areaId
    }
  }

  // Apply storage unit filter
  if (filters.storageUnitId) {
    whereCondition.storageUnitId = filters.storageUnitId
  }

  const items = await prisma.item.findMany({
    where: whereCondition,
    include: {
      storageUnit: {
        include: {
          area: {
            include: {
              location: true
            }
          }
        }
      },
      inventoryMovements: {
        orderBy: {
          movementDate: 'desc'
        },
        take: 1
      }
    }
  })

  const lowStockThreshold = filters.lowStockThreshold || 10

  return items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    quantity: item.quantity,
    price: item.price || undefined,
    sku: item.sku || undefined,
    locationName: item.storageUnit.area.location.name,
    areaName: item.storageUnit.area.name,
    storageUnitName: item.storageUnit.name,
    lastMovementDate: item.inventoryMovements[0]?.movementDate,
    isLowStock: item.quantity <= lowStockThreshold
  }))
}

// Get low stock items by category
export async function getLowStockReport(threshold: number = 10): Promise<ItemReport[]> {
  const items = await prisma.item.findMany({
    where: {
      quantity: {
        lte: threshold
      }
    },
    include: {
      storageUnit: {
        include: {
          area: {
            include: {
              location: true
            }
          }
        }
      },
      inventoryMovements: {
        orderBy: {
          movementDate: 'desc'
        },
        take: 1
      }
    }
  })

  return items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    quantity: item.quantity,
    price: item.price || undefined,
    sku: item.sku || undefined,
    locationName: item.storageUnit.area.location.name,
    areaName: item.storageUnit.area.name,
    storageUnitName: item.storageUnit.name,
    lastMovementDate: item.inventoryMovements[0]?.movementDate,
    isLowStock: true
  }))
}

// Get inventory movement report
export async function getMovementReport(filters: ReportFilter = {}): Promise<any[]> {
  const whereCondition: any = {}

  if (filters.dateFrom && filters.dateTo) {
    whereCondition.movementDate = {
      gte: filters.dateFrom,
      lte: filters.dateTo
    }
  }

  const movements = await prisma.inventoryMovement.findMany({
    where: whereCondition,
    include: {
      item: {
        include: {
          storageUnit: {
            include: {
              area: {
                include: {
                  location: true
                }
              }
            }
          }
        }
      },
      fromStorageUnit: {
        include: {
          area: {
            include: {
              location: true
            }
          }
        }
      },
      toStorageUnit: {
        include: {
          area: {
            include: {
              location: true
            }
          }
        }
      }
    },
    orderBy: {
      movementDate: 'desc'
    }
  })

  return movements.map(movement => ({
    id: movement.id,
    itemName: movement.item.name,
    quantity: movement.quantity,
    movementType: movement.movementType,
    movementDate: movement.movementDate,
    fromLocation: movement.fromStorageUnit?.area.location.name,
    fromArea: movement.fromStorageUnit?.area.name,
    fromStorageUnit: movement.fromStorageUnit?.name,
    toLocation: movement.toStorageUnit?.area.location.name,
    toArea: movement.toStorageUnit?.area.name,
    toStorageUnit: movement.toStorageUnit?.name,
    notes: movement.notes
  }))
} 