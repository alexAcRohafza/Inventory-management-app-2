import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import NotificationService, { NotificationType } from '@/lib/notification-service'

// GET /api/inventory-movements - Get inventory movements with filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const movementType = searchParams.get('movementType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where condition
    const whereCondition: any = {}

    if (itemId) {
      whereCondition.itemId = itemId
    }

    if (movementType) {
      whereCondition.movementType = movementType
    }

    if (dateFrom && dateTo) {
      whereCondition.movementDate = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    } else if (dateFrom) {
      whereCondition.movementDate = {
        gte: new Date(dateFrom)
      }
    } else if (dateTo) {
      whereCondition.movementDate = {
        lte: new Date(dateTo)
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
      },
      take: limit
    })

    const transformedMovements = movements.map(movement => ({
      id: movement.id,
      itemId: movement.itemId,
      itemName: movement.item.name,
      quantity: movement.quantity,
      movementType: movement.movementType,
      movementDate: movement.movementDate,
      notes: movement.notes,
      fromStorageUnit: movement.fromStorageUnit ? {
        id: movement.fromStorageUnit.id,
        name: movement.fromStorageUnit.name,
        areaName: movement.fromStorageUnit.area.name,
        locationName: movement.fromStorageUnit.area.location.name
      } : null,
      toStorageUnit: movement.toStorageUnit ? {
        id: movement.toStorageUnit.id,
        name: movement.toStorageUnit.name,
        areaName: movement.toStorageUnit.area.name,
        locationName: movement.toStorageUnit.area.location.name
      } : null,
      item: {
        id: movement.item.id,
        name: movement.item.name,
        currentQuantity: movement.item.quantity,
        storageUnit: {
          name: movement.item.storageUnit.name,
          areaName: movement.item.storageUnit.area.name,
          locationName: movement.item.storageUnit.area.location.name
        }
      },
      createdAt: movement.createdAt
    }))

    return NextResponse.json(transformedMovements)

  } catch (error: any) {
    console.error('Failed to fetch inventory movements:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch inventory movements',
      details: error.message 
    }, { status: 500 })
  }
}

// POST /api/inventory-movements - Create new inventory movement
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only MANAGER+ can create movements
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      itemId, 
      movementType, 
      quantity, 
      reason,
      notes,
      fromStorageUnitId,
      toStorageUnitId,
      reference
    } = body

    // Validate required fields
    if (!itemId || !movementType || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId, movementType, and positive quantity are required' 
      }, { status: 400 })
    }

    // Validate movement type
    const validMovementTypes = ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']
    if (!validMovementTypes.includes(movementType)) {
      return NextResponse.json({ 
        error: `Invalid movement type. Must be one of: ${validMovementTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Get current item with current quantity
    const currentItem = await prisma.item.findUnique({
      where: { id: itemId },
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

    if (!currentItem) {
      return NextResponse.json({ 
        error: 'Item not found' 
      }, { status: 404 })
    }

    // Calculate new quantity based on movement type
    let newQuantity = currentItem.quantity
    let actualFromStorageUnitId = fromStorageUnitId
    let actualToStorageUnitId = toStorageUnitId

    switch (movementType) {
      case 'IN':
        newQuantity += quantity
        actualToStorageUnitId = actualToStorageUnitId || currentItem.storageUnitId
        break
        
      case 'OUT':
        if (quantity > currentItem.quantity) {
          return NextResponse.json({ 
            error: `Cannot remove ${quantity} items. Only ${currentItem.quantity} in stock.` 
          }, { status: 400 })
        }
        newQuantity -= quantity
        actualFromStorageUnitId = actualFromStorageUnitId || currentItem.storageUnitId
        break
        
      case 'ADJUSTMENT':
        // For adjustments, the quantity represents the final amount, not the change
        newQuantity = quantity
        actualToStorageUnitId = actualToStorageUnitId || currentItem.storageUnitId
        break
        
      case 'TRANSFER':
        // For transfers, we need both from and to storage units
        if (!fromStorageUnitId || !toStorageUnitId) {
          return NextResponse.json({ 
            error: 'Transfer movements require both fromStorageUnitId and toStorageUnitId' 
          }, { status: 400 })
        }
        
        if (quantity > currentItem.quantity) {
          return NextResponse.json({ 
            error: `Cannot transfer ${quantity} items. Only ${currentItem.quantity} in stock.` 
          }, { status: 400 })
        }
        
        // Update item's storage unit to the destination
        await prisma.item.update({
          where: { id: itemId },
          data: { storageUnitId: toStorageUnitId }
        })
        break
        
      default:
        return NextResponse.json({ 
          error: 'Invalid movement type' 
        }, { status: 400 })
    }

    // Start a transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          itemId,
          quantity,
          movementType,
          fromStorageUnitId: actualFromStorageUnitId,
          toStorageUnitId: actualToStorageUnitId,
          notes: `${reason ? reason + ': ' : ''}${notes || ''}${reference ? ` (Ref: ${reference})` : ''}`.trim() || null
        },
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
        }
      })

      // Update item quantity (except for TRANSFER which doesn't change quantity)
      if (movementType !== 'TRANSFER') {
        await tx.item.update({
          where: { id: itemId },
          data: { quantity: newQuantity }
        })
      }

      return movement
    })

    // Send notifications
    try {
      const userId = session.user.email! // Use email as user ID for notifications
      
      // Notify about the movement
      await NotificationService.notifyInventoryMovement(
        userId,
        currentItem.name,
        movementType,
        quantity,
        result.fromStorageUnit ? `${result.fromStorageUnit.area.location.name} - ${result.fromStorageUnit.area.name} - ${result.fromStorageUnit.name}` : undefined,
        result.toStorageUnit ? `${result.toStorageUnit.area.location.name} - ${result.toStorageUnit.area.name} - ${result.toStorageUnit.name}` : undefined
      )

      // Check for low stock and notify
      const finalQuantity = movementType === 'TRANSFER' ? currentItem.quantity : newQuantity
      const lowStockThreshold = 10 // Could be made configurable
      
      if (finalQuantity <= lowStockThreshold && ['OUT', 'ADJUSTMENT'].includes(movementType)) {
        await NotificationService.notifyLowStock(
          userId,
          currentItem.name,
          finalQuantity,
          lowStockThreshold
        )
      }

      // Notify about stock change
      if (movementType !== 'TRANSFER') {
        await NotificationService.notifyStockUpdated(
          userId,
          currentItem.name,
          currentItem.quantity,
          newQuantity
        )
      }
      
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError)
      // Don't fail the whole operation for notification errors
    }

    return NextResponse.json({
      success: true,
      movement: {
        id: result.id,
        itemId: result.itemId,
        itemName: result.item.name,
        quantity: result.quantity,
        movementType: result.movementType,
        movementDate: result.movementDate,
        notes: result.notes,
        oldQuantity: currentItem.quantity,
        newQuantity: movementType === 'TRANSFER' ? currentItem.quantity : newQuantity,
        fromStorageUnit: result.fromStorageUnit ? {
          name: result.fromStorageUnit.name,
          areaName: result.fromStorageUnit.area.name,
          locationName: result.fromStorageUnit.area.location.name
        } : null,
        toStorageUnit: result.toStorageUnit ? {
          name: result.toStorageUnit.name,
          areaName: result.toStorageUnit.area.name,
          locationName: result.toStorageUnit.area.location.name
        } : null
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Failed to create inventory movement:', error)
    return NextResponse.json({ 
      error: 'Failed to create inventory movement',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function to create inventory movement (can be used by other parts of the app)
export async function createInventoryMovement(
  itemId: string,
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
  quantity: number,
  options: {
    reason?: string
    notes?: string
    fromStorageUnitId?: string
    toStorageUnitId?: string
    reference?: string
    userId?: string
  } = {}
) {
  const movement = await prisma.inventoryMovement.create({
    data: {
      itemId,
      quantity,
      movementType,
      fromStorageUnitId: options.fromStorageUnitId,
      toStorageUnitId: options.toStorageUnitId,
      notes: `${options.reason ? options.reason + ': ' : ''}${options.notes || ''}${options.reference ? ` (Ref: ${options.reference})` : ''}`.trim() || null
    },
    include: {
      item: true,
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
    }
  })

  return movement
} 