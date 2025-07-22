import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test users with hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const workerPassword = await bcrypt.hash('worker123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      role: 'MANAGER'
    }
  })

  const workerUser = await prisma.user.upsert({
    where: { email: 'worker@example.com' },
    update: {},
    create: {
      email: 'worker@example.com',
      password: workerPassword,
      role: 'WORKER'
    }
  })

  console.log('✅ Created users:', {
    admin: adminUser.email,
    manager: managerUser.email,
    worker: workerUser.email
  })

  // Create vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { id: 'vendor-1' },
    update: {},
    create: {
      id: 'vendor-1',
      name: 'Tech Supplies Inc',
      contact: 'contact@techsupplies.com'
    }
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { id: 'vendor-2' },
    update: {},
    create: {
      id: 'vendor-2',
      name: 'Office Equipment Co',
      contact: 'orders@officeequip.com'
    }
  })

  console.log('✅ Created vendors:', vendor1.name, vendor2.name)

  // Create locations
  const mainWarehouse = await prisma.location.upsert({
    where: { id: 'location-1' },
    update: {},
    create: {
      id: 'location-1',
      name: 'Main Warehouse',
      address: '123 Industrial Ave, City, State 12345'
    }
  })

  const distributionCenter = await prisma.location.upsert({
    where: { id: 'location-2' },
    update: {},
    create: {
      id: 'location-2',
      name: 'Distribution Center',
      address: '456 Commerce Blvd, City, State 12346'
    }
  })

  console.log('✅ Created locations:', mainWarehouse.name, distributionCenter.name)

  // Create areas in main warehouse
  const warehouseAreaA = await prisma.area.upsert({
    where: { id: 'area-1' },
    update: {},
    create: {
      id: 'area-1',
      name: 'Section A',
      locationId: mainWarehouse.id
    }
  })

  const warehouseAreaB = await prisma.area.upsert({
    where: { id: 'area-2' },
    update: {},
    create: {
      id: 'area-2',
      name: 'Section B',
      locationId: mainWarehouse.id
    }
  })

  // Create areas in distribution center
  const dcAreaA = await prisma.area.upsert({
    where: { id: 'area-3' },
    update: {},
    create: {
      id: 'area-3',
      name: 'DC Section A',
      locationId: distributionCenter.id
    }
  })

  console.log('✅ Created areas in warehouses')

  // Create storage units
  const storageUnits = [
    { id: 'unit-1', name: 'Shelf A1', areaId: warehouseAreaA.id },
    { id: 'unit-2', name: 'Shelf A2', areaId: warehouseAreaA.id },
    { id: 'unit-3', name: 'Shelf B1', areaId: warehouseAreaB.id },
    { id: 'unit-4', name: 'Shelf B2', areaId: warehouseAreaB.id },
    { id: 'unit-5', name: 'DC Rack 1', areaId: dcAreaA.id },
    { id: 'unit-6', name: 'DC Rack 2', areaId: dcAreaA.id }
  ]

  for (const unit of storageUnits) {
    await prisma.storageUnit.upsert({
      where: { id: unit.id },
      update: {},
      create: unit
    })
  }

  console.log('✅ Created storage units')

  // Create sample items
  const sampleItems = [
    {
      id: 'item-1',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless optical mouse',
      quantity: 150,
      price: 29.99,
      sku: 'WM-001',
      storageUnitId: 'unit-1'
    },
    {
      id: 'item-2',
      name: 'USB-C Cable',
      description: '6ft USB-C charging cable',
      quantity: 8, // Low stock item
      price: 12.99,
      sku: 'UC-002',
      storageUnitId: 'unit-1'
    },
    {
      id: 'item-3',
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand',
      quantity: 45,
      price: 79.99,
      sku: 'LS-003',
      storageUnitId: 'unit-2'
    },
    {
      id: 'item-4',
      name: 'Office Chair',
      description: 'Ergonomic office chair with lumbar support',
      quantity: 12,
      price: 299.99,
      sku: 'OC-004',
      storageUnitId: 'unit-3'
    },
    {
      id: 'item-5',
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      quantity: 3, // Low stock item
      price: 49.99,
      sku: 'DL-005',
      storageUnitId: 'unit-4'
    },
    {
      id: 'item-6',
      name: 'Monitor',
      description: '24-inch Full HD LED monitor',
      quantity: 25,
      price: 199.99,
      sku: 'MON-006',
      storageUnitId: 'unit-5'
    },
    {
      id: 'item-7',
      name: 'Keyboard',
      description: 'Mechanical keyboard with RGB lighting',
      quantity: 0, // Out of stock item
      price: 129.99,
      sku: 'KB-007',
      storageUnitId: 'unit-6'
    }
  ]

  for (const item of sampleItems) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: item
    })
  }

  console.log('✅ Created sample items')

  // Create some sample inventory movements
  const movements = [
    {
      id: 'mov-1',
      itemId: 'item-1',
      quantity: 50,
      movementType: 'IN',
      toStorageUnitId: 'unit-1',
      notes: 'Initial stock - Purchase from vendor',
      movementDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 'mov-2',
      itemId: 'item-2',
      quantity: 20,
      movementType: 'OUT',
      fromStorageUnitId: 'unit-1',
      notes: 'Sold to customer batch #1',
      movementDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: 'mov-3',
      itemId: 'item-3',
      quantity: 15,
      movementType: 'TRANSFER',
      fromStorageUnitId: 'unit-1',
      toStorageUnitId: 'unit-2',
      notes: 'Reorganization - moved to better location',
      movementDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: 'mov-4',
      itemId: 'item-7',
      quantity: 15,
      movementType: 'OUT',
      fromStorageUnitId: 'unit-6',
      notes: 'Bulk sale - depleted stock',
      movementDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  ]

  for (const movement of movements) {
    await prisma.inventoryMovement.upsert({
      where: { id: movement.id },
      update: {},
      create: movement
    })
  }

  console.log('✅ Created sample inventory movements')

  // Create sample notifications for the admin user
  const notifications = [
    {
      id: 'notif-1',
      type: 'low_stock',
      userId: adminUser.id,
      message: 'Low stock alert: USB-C Cable has 8 units remaining (below threshold of 10)',
      read: false,
      metadata: JSON.stringify({
        itemName: 'USB-C Cable',
        currentQuantity: 8,
        threshold: 10,
        alertLevel: 'warning'
      })
    },
    {
      id: 'notif-2',
      type: 'low_stock',
      userId: adminUser.id,
      message: 'Low stock alert: Desk Lamp has 3 units remaining (below threshold of 10)',
      read: false,
      metadata: JSON.stringify({
        itemName: 'Desk Lamp',
        currentQuantity: 3,
        threshold: 10,
        alertLevel: 'warning'
      })
    },
    {
      id: 'notif-3',
      type: 'inventory_movement',
      userId: adminUser.id,
      message: 'Inventory movement: 15 units of Keyboard out removed from Distribution Center - DC Section A - DC Rack 2',
      read: true,
      metadata: JSON.stringify({
        itemName: 'Keyboard',
        movementType: 'OUT',
        quantity: 15,
        toLocation: 'Distribution Center - DC Section A - DC Rack 2'
      }),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {},
      create: notification
    })
  }

  console.log('✅ Created sample notifications')

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Test accounts created:')
  console.log('  Admin: admin@example.com / admin123')
  console.log('  Manager: manager@example.com / manager123')
  console.log('  Worker: worker@example.com / worker123')
  console.log('')
  console.log('Sample data includes:')
  console.log('  - 2 locations (Main Warehouse, Distribution Center)')
  console.log('  - 3 areas across locations')
  console.log('  - 6 storage units')
  console.log('  - 7 sample items (some low/out of stock)')
  console.log('  - 4 sample inventory movements')
  console.log('  - 3 sample notifications')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 