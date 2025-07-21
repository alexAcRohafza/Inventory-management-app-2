import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

export class NotificationService {
  static async createNotification(
    type: NotificationType,
    userId: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationData> {
    try {
      const notification = await prisma.notification.create({
        data: {
          type,
          userId,
          message,
          read: false,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      })

      return {
        id: notification.id,
        type: notification.type as NotificationType,
        userId: notification.userId,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  static async getUserNotifications(
    userId: string,
    limit = 50,
    unreadOnly = false
  ): Promise<NotificationData[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly ? { read: false } : {})
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type as NotificationType,
        userId: notification.userId,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined
      }))
    } catch (error) {
      console.error('Failed to get user notifications:', error)
      throw new Error('Failed to get notifications')
    }
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  static async markAllNotificationsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId }
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw new Error('Failed to delete notification')
    }
  }

  // Helper methods for common notification types
  static async notifyLowStock(userId: string, itemName: string, currentQuantity: number, threshold: number) {
    const message = `Low stock alert: ${itemName} has ${currentQuantity} units remaining (below threshold of ${threshold})`
    const metadata = {
      itemName,
      currentQuantity,
      threshold,
      alertLevel: 'warning'
    }
    
    return this.createNotification(NotificationType.LOW_STOCK, userId, message, metadata)
  }

  static async notifyStockUpdated(userId: string, itemName: string, oldQuantity: number, newQuantity: number) {
    const message = `Stock updated: ${itemName} quantity changed from ${oldQuantity} to ${newQuantity}`
    const metadata = {
      itemName,
      oldQuantity,
      newQuantity,
      changeType: newQuantity > oldQuantity ? 'increase' : 'decrease'
    }
    
    return this.createNotification(NotificationType.STOCK_UPDATED, userId, message, metadata)
  }

  static async notifyItemAdded(userId: string, itemName: string) {
    const message = `New item added to inventory: ${itemName}`
    const metadata = { itemName }
    
    return this.createNotification(NotificationType.ITEM_ADDED, userId, message, metadata)
  }

  static async notifyInventoryMovement(
    userId: string, 
    itemName: string, 
    movementType: string, 
    quantity: number,
    fromLocation?: string,
    toLocation?: string
  ) {
    let message = `Inventory movement: ${quantity} units of ${itemName} ${movementType.toLowerCase()}`
    
    if (fromLocation && toLocation) {
      message += ` moved from ${fromLocation} to ${toLocation}`
    } else if (fromLocation) {
      message += ` removed from ${fromLocation}`
    } else if (toLocation) {
      message += ` added to ${toLocation}`
    }
    
    const metadata = {
      itemName,
      movementType,
      quantity,
      fromLocation,
      toLocation
    }
    
    return this.createNotification(NotificationType.INVENTORY_MOVEMENT, userId, message, metadata)
  }
}

export default NotificationService 