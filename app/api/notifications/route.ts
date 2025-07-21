import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import NotificationService, { NotificationType } from '@/lib/notification-service'

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // For demo purposes, using email as userId. In real app, you'd get user ID from session
    const userId = session.user.email
    
    const notifications = await NotificationService.getUserNotifications(
      userId,
      limit,
      unreadOnly
    )

    return NextResponse.json({
      success: true,
      notifications
    })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, message, metadata, targetUserId } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      )
    }

    // Use targetUserId if provided (for admin notifications), otherwise use current user
    const userId = targetUserId || session.user.email

    const notification = await NotificationService.createNotification(
      type as NotificationType,
      userId,
      message,
      metadata
    )

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      const userId = session.user.email
      await NotificationService.markAllNotificationsRead(userId)
    } else if (notificationId) {
      await NotificationService.markNotificationRead(notificationId)
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllRead must be provided' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })
  } catch (error) {
    console.error('Failed to mark notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const notificationId = pathSegments[pathSegments.length - 1]

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    await NotificationService.deleteNotification(notificationId)

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
} 