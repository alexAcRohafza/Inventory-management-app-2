'use client'

import { useSession, signOut } from 'next-auth/react'
import { 
  isAdmin, 
  isManagerOrHigher, 
  canManageInventory, 
  canViewReports, 
  canManageUsers,
  getRoleDisplayName 
} from '@/lib/role-utils'

export default function RoleDemo() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!session) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">Please sign in to see role-based content.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Welcome, {session.user.name}!</h3>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {getRoleDisplayName(session.user.role)}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Role-Based Access Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Admin Only */}
        <div className={`p-4 rounded-lg border-2 ${isAdmin(session) 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className="font-medium text-gray-900 mb-2">Admin Panel</h4>
          {isAdmin(session) ? (
            <p className="text-green-700 text-sm">✅ You have admin access!</p>
          ) : (
            <p className="text-gray-500 text-sm">❌ Admin role required</p>
          )}
        </div>

        {/* Manager or Higher */}
        <div className={`p-4 rounded-lg border-2 ${isManagerOrHigher(session) 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className="font-medium text-gray-900 mb-2">User Management</h4>
          {canManageUsers(session) ? (
            <p className="text-green-700 text-sm">✅ You can manage users</p>
          ) : (
            <p className="text-gray-500 text-sm">❌ Manager role required</p>
          )}
        </div>

        {/* Worker or Higher */}
        <div className={`p-4 rounded-lg border-2 ${canManageInventory(session) 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className="font-medium text-gray-900 mb-2">Inventory Management</h4>
          {canManageInventory(session) ? (
            <p className="text-green-700 text-sm">✅ You can manage inventory</p>
          ) : (
            <p className="text-gray-500 text-sm">❌ Worker role required</p>
          )}
        </div>

        {/* Reports */}
        <div className={`p-4 rounded-lg border-2 ${canViewReports(session) 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className="font-medium text-gray-900 mb-2">Reports</h4>
          {canViewReports(session) ? (
            <p className="text-green-700 text-sm">✅ You can view reports</p>
          ) : (
            <p className="text-gray-500 text-sm">❌ Worker role required</p>
          )}
        </div>

      </div>

      {/* Role Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">Role Hierarchy</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Admin:</strong> Full system access</p>
          <p><strong>Manager:</strong> User management + all worker permissions</p>
          <p><strong>Worker:</strong> Inventory management and reports</p>
          <p><strong>Vendor:</strong> Limited access</p>
        </div>
      </div>
    </div>
  )
} 