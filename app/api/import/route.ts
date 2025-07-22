import { NextRequest, NextResponse } from 'next/server'
import { parseCSV, resolveStorageUnits, importCSVItems } from '@/lib/csv-import-export'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a CSV file.' 
      }, { status: 400 })
    }

    // Read file content
    const csvContent = await file.text()

    if (!csvContent.trim()) {
      return NextResponse.json({ 
        error: 'File is empty' 
      }, { status: 400 })
    }

    // Parse CSV
    const parseResult = await parseCSV(csvContent)

    if (parseResult.validRows === 0) {
      return NextResponse.json({
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        importedRows: 0,
        errors: parseResult.errors
      }, { status: 400 })
    }

    // Resolve storage unit IDs
    const resolvedItems = await resolveStorageUnits(parseResult.data)

    // Import items
    const importResult = await importCSVItems(resolvedItems)

    // Combine errors from parsing and importing
    const allErrors = [...parseResult.errors, ...importResult.errors]

    return NextResponse.json({
      totalRows: parseResult.totalRows,
      validRows: parseResult.validRows,
      importedRows: importResult.imported,
      errors: allErrors
    })

  } catch (error: any) {
    console.error('CSV import error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during import',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return CSV template/format information
    const template = {
      requiredFields: ['Name', 'Quantity', 'StorageUnitName'],
      optionalFields: ['Description', 'Price', 'SKU', 'LocationName', 'AreaName'],
      sampleData: [
        {
          Name: 'Sample Product',
          Description: 'Product description',
          Quantity: 100,
          Price: 29.99,
          SKU: 'SAMPLE-001',
          StorageUnitName: 'Shelf A1',
          AreaName: 'Warehouse Section A',
          LocationName: 'Main Warehouse'
        }
      ],
      notes: [
        'Name, Quantity, and StorageUnitName are required fields',
        'Quantity must be a non-negative number',
        'Price must be a non-negative number (if provided)',
        'SKU must be unique (if provided)',
        'StorageUnitName must match an existing storage unit in your system',
        'LocationName and AreaName help identify the correct storage unit if multiple units have the same name'
      ]
    }

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('Template fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 