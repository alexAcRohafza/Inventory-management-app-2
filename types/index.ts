export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
  VENDOR = 'VENDOR'
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  STOCK_UPDATED = 'stock_updated',
  ITEM_ADDED = 'item_added',
  ITEM_REMOVED = 'item_removed',
  INVENTORY_MOVEMENT = 'inventory_movement',
  SYSTEM_ALERT = 'system_alert'
}

export interface NotificationData {
  id: string
  type: NotificationType
  userId: string
  message: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
  supplier: string
  lastUpdated: Date
} 