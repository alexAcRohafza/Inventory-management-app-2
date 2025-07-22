import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UserRole } from '@/types'

// Define public routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/unauthorized', '/api/auth', '/api/health']

// Define role-based route access
const ROUTE_PERMISSIONS = {
  '/admin': [UserRole.ADMIN],
  '/users': [UserRole.ADMIN],
  '/settings': [UserRole.ADMIN, UserRole.MANAGER],
  '/reports': [UserRole.ADMIN, UserRole.MANAGER],
  '/vendors': [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR],
  '/locations': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/areas': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/storage-units': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/items': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/inventory': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/inventory-movements': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/map': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/notifications': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR],
  '/dashboard': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR],
  '/': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR] // Dashboard/Home
}

// API endpoint permissions
const API_PERMISSIONS = {
  '/api/items': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/api/inventory-movements': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER],
  '/api/reports': [UserRole.ADMIN, UserRole.MANAGER],
  '/api/notifications': [UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER, UserRole.VENDOR],
  '/api/import': [UserRole.ADMIN, UserRole.MANAGER],
  '/api/ai': [UserRole.ADMIN, UserRole.MANAGER],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes and API auth routes
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect to login if no token and accessing protected route
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as UserRole

  // Check API permissions
  if (pathname.startsWith('/api/')) {
    for (const [apiPath, allowedRoles] of Object.entries(API_PERMISSIONS)) {
      if (pathname.startsWith(apiPath)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
        break
      }
    }
    return NextResponse.next()
  }

  // Check page route permissions
  for (const [routePath, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === routePath || (routePath !== '/' && pathname.startsWith(routePath))) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      break
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 