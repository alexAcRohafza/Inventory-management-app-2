import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types'

// GET /api/items - Get all items with optional filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const areaId = searchParams.get('areaId')
    const storageUnitId = searchParams.get('storageUnitId')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'
    const search = searchParams.get('search')

    // Build where condition
    const whereCondition: any = {}

    if (storageUnitId) {
      whereCondition.storageUnitId = storageUnitId
    } else if (areaId) {
      whereCondition.storageUnit = {
        areaId: areaId
      }
    } else if (locationId) {
      whereCondition.storageUnit = {
        area: {
          locationId: locationId
        }
      }
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (lowStockOnly) {
      whereCondition.quantity = { lte: 10 } // Default low stock threshold
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
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data to match frontend expectations
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      sku: item.sku,
      stockQuantity: item.quantity, // Alias for compatibility
      barcode: item.sku, // Use SKU as barcode for compatibility
      category: 'General', // Default category
      supplier: 'Unknown', // Default supplier
      location: {
        warehouse: item.storageUnit.area.location.name,
        zone: item.storageUnit.area.name,
        aisle: item.storageUnit.name,
        shelf: '',
        bin: ''
      },
      storageUnit: {
        id: item.storageUnit.id,
        name: item.storageUnit.name,
        areaId: item.storageUnit.areaId,
        areaName: item.storageUnit.area.name,
        locationId: item.storageUnit.area.locationId,
        locationName: item.storageUnit.area.location.name
      },
      lastMovementDate: item.inventoryMovements[0]?.movementDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    return NextResponse.json(transformedItems)

  } catch (error: any) {
    console.error('Failed to fetch items:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch items',
      details: error.message 
    }, { status: 500 })
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only MANAGER+ can create items
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, quantity, price, sku, storageUnitId } = body

    // Validate required fields
    if (!name || quantity === undefined || !storageUnitId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, quantity, and storageUnitId are required' 
      }, { status: 400 })
    }

    // Check if SKU is unique (if provided)
    if (sku) {
      const existingItem = await prisma.item.findUnique({
        where: { sku: sku }
      })

      if (existingItem) {
        return NextResponse.json({ 
          error: 'SKU already exists' 
        }, { status: 400 })
      }
    }

    // Verify storage unit exists
    const storageUnit = await prisma.storageUnit.findUnique({
      where: { id: storageUnitId },
      include: {
        area: {
          include: {
            location: true
          }
        }
      }
    })

    if (!storageUnit) {
      return NextResponse.json({ 
        error: 'Storage unit not found' 
      }, { status: 400 })
    }

    // Create the item
    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        quantity: parseInt(quantity),
        price: price ? parseFloat(price) : null,
        sku: sku?.trim() || null,
        storageUnitId
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku,
        storageUnitId: item.storageUnitId,
        storageUnit: {
          id: item.storageUnit.id,
          name: item.storageUnit.name,
          areaName: item.storageUnit.area.name,
          locationName: item.storageUnit.area.location.name
        },
        createdAt: item.createdAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Failed to create item:', error)
    return NextResponse.json({ 
      error: 'Failed to create item',
      details: error.message 
    }, { status: 500 })
  }
}

// PUT /api/items - Update existing item
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only MANAGER+ can update items
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, description, quantity, price, sku, storageUnitId } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'Item ID is required' 
      }, { status: 400 })
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json({ 
        error: 'Item not found' 
      }, { status: 404 })
    }

    // Check SKU uniqueness if it's being changed
    if (sku && sku !== existingItem.sku) {
      const skuExists = await prisma.item.findFirst({
        where: { 
          sku: sku,
          id: { not: id }
        }
      })

      if (skuExists) {
        return NextResponse.json({ 
          error: 'SKU already exists' 
        }, { status: 400 })
      }
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(sku !== undefined && { sku: sku?.trim() || null }),
        ...(storageUnitId && { storageUnitId })
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        quantity: updatedItem.quantity,
        price: updatedItem.price,
        sku: updatedItem.sku,
        storageUnitId: updatedItem.storageUnitId,
        storageUnit: {
          id: updatedItem.storageUnit.id,
          name: updatedItem.storageUnit.name,
          areaName: updatedItem.storageUnit.area.name,
          locationName: updatedItem.storageUnit.area.location.name
        },
        updatedAt: updatedItem.updatedAt
      }
    })

  } catch (error: any) {
    console.error('Failed to update item:', error)
    return NextResponse.json({ 
      error: 'Failed to update item',
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE /api/items - Delete item
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only ADMIN can delete items
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ 
        error: 'Item ID is required' 
      }, { status: 400 })
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json({ 
        error: 'Item not found' 
      }, { status: 404 })
    }

    // Check if item has inventory movements
    const hasMovements = await prisma.inventoryMovement.findFirst({
      where: { itemId }
    })

    if (hasMovements) {
      return NextResponse.json({ 
        error: 'Cannot delete item with existing inventory movements' 
      }, { status: 400 })
    }

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error: any) {
    console.error('Failed to delete item:', error)
    return NextResponse.json({ 
      error: 'Failed to delete item',
      details: error.message 
    }, { status: 500 })
  }
} 