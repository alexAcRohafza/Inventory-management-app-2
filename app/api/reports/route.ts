import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { 
  getItemsForReport, 
  getLowStockReport, 
  getMovementReport, 
  generateItemsCSV 
} from '@/lib/csv-import-export'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const format = searchParams.get('format') // 'json' or 'csv'
    const locationId = searchParams.get('locationId')
    const areaId = searchParams.get('areaId')
    const storageUnitId = searchParams.get('storageUnitId')
    const lowStockThreshold = searchParams.get('lowStockThreshold')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build filter object
    const filters = {
      locationId: locationId || undefined,
      areaId: areaId || undefined,
      storageUnitId: storageUnitId || undefined,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined
    }

    let reportData: any = []
    let filename = 'report'

    switch (reportType) {
      case 'inventory':
        reportData = await getItemsForReport(filters)
        filename = 'inventory-report'
        break

      case 'low-stock':
        const threshold = filters.lowStockThreshold || 10
        reportData = await getLowStockReport(threshold)
        filename = 'low-stock-report'
        break

      case 'movements':
        reportData = await getMovementReport(filters)
        filename = 'movement-report'
        break

      case 'locations':
        reportData = await getLocationHierarchy()
        filename = 'locations-report'
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid report type. Valid types: inventory, low-stock, movements, locations' 
        }, { status: 400 })
    }

    // Return CSV format if requested
    if (format === 'csv') {
      let csvContent: string

      if (reportType === 'inventory' || reportType === 'low-stock') {
        csvContent = await generateItemsCSV(filters)
      } else if (reportType === 'movements') {
        // Generate CSV for movements
        const csvData = reportData.map((movement: any) => ({
          'Item Name': movement.itemName,
          'Quantity': movement.quantity,
          'Movement Type': movement.movementType,
          'Movement Date': movement.movementDate.toISOString().split('T')[0],
          'From Location': movement.fromLocation || '',
          'From Area': movement.fromArea || '',
          'From Storage Unit': movement.fromStorageUnit || '',
          'To Location': movement.toLocation || '',
          'To Area': movement.toArea || '',
          'To Storage Unit': movement.toStorageUnit || '',
          'Notes': movement.notes || ''
        }))
        
        const Papa = require('papaparse')
        csvContent = Papa.unparse(csvData)
      } else {
        // Generic CSV generation for other reports
        const Papa = require('papaparse')
        csvContent = Papa.unparse(reportData)
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      type: reportType,
      filters: filters,
      data: reportData,
      totalRecords: reportData.length,
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during report generation',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function to get location hierarchy
async function getLocationHierarchy() {
  const locations = await prisma.location.findMany({
    include: {
      areas: {
        include: {
          storageUnits: true
        }
      }
    }
  })

  return locations.map(location => ({
    id: location.id,
    name: location.name,
    address: location.address,
    areas: location.areas.map(area => ({
      id: area.id,
      name: area.name,
      locationId: area.locationId,
      storageUnits: area.storageUnits.map(unit => ({
        id: unit.id,
        name: unit.name,
        areaId: unit.areaId
      }))
    }))
  }))
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportType, filters, format } = body

    // This endpoint allows for more complex report generation
    // with custom filters passed in the request body
    let reportData: any = []

    switch (reportType) {
      case 'custom-inventory':
        reportData = await getItemsForReport(filters)
        break

      case 'custom-movements':
        reportData = await getMovementReport(filters)
        break

      case 'analytics':
        // Custom analytics report
        reportData = await generateAnalyticsReport(filters)
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid report type for POST request' 
        }, { status: 400 })
    }

    if (format === 'csv') {
      const Papa = require('papaparse')
      const csvContent = Papa.unparse(reportData)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="custom-report-${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json({
      type: reportType,
      filters,
      data: reportData,
      totalRecords: reportData.length,
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Custom report generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during custom report generation',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function for analytics report
async function generateAnalyticsReport(filters: any) {
  // Get inventory summary by location
  const inventoryByLocation = await prisma.$queryRaw`
    SELECT 
      l.name as location_name,
      COUNT(i.id) as total_items,
      SUM(i.quantity) as total_quantity,
      AVG(i.quantity) as avg_quantity,
      SUM(CASE WHEN i.quantity <= 10 THEN 1 ELSE 0 END) as low_stock_items
    FROM "Location" l
    LEFT JOIN "Area" a ON l.id = a."locationId"
    LEFT JOIN "StorageUnit" su ON a.id = su."areaId"
    LEFT JOIN "Item" i ON su.id = i."storageUnitId"
    GROUP BY l.id, l.name
    ORDER BY l.name
  `

  // Get recent movement trends
  const movementTrends = await prisma.$queryRaw`
    SELECT 
      DATE(im."movementDate") as movement_date,
      im."movementType",
      COUNT(*) as movement_count,
      SUM(im.quantity) as total_quantity
    FROM "InventoryMovement" im
    WHERE im."movementDate" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(im."movementDate"), im."movementType"
    ORDER BY movement_date DESC, im."movementType"
  `

  return {
    inventoryByLocation,
    movementTrends,
    reportGeneratedAt: new Date().toISOString()
  }
} 