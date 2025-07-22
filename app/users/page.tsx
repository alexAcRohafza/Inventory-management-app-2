'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminOnly } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface User {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'MANAGER' | 'WORKER' | 'VENDOR'
  createdAt: string
  lastLogin?: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit'>('view')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ 
    email: '', 
    name: '', 
    role: '' as 'ADMIN' | 'MANAGER' | 'WORKER' | 'VENDOR' 
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      // Mock data for now
      setUsers([
        { 
          id: '1', 
          email: 'admin@example.com', 
          name: 'Administrator',
          role: 'ADMIN',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          lastLogin: new Date().toISOString()
        },
        { 
          id: '2', 
          email: 'manager@example.com', 
          name: 'Manager User',
          role: 'MANAGER',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          lastLogin: new Date(Date.now() - 86400000).toISOString()
        },
        { 
          id: '3', 
          email: 'worker@example.com', 
          name: 'Warehouse Worker',
          role: 'WORKER',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        { 
          id: '4', 
          email: 'vendor@example.com', 
          name: 'Vendor Representative',
          role: 'VENDOR',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.name || user.email}"?`)) {
      try {
        // Mock API call - replace with real API
        setUsers(prev => prev.filter(u => u.id !== user.id))
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleResetPassword = async (user: User) => {
    if (window.confirm(`Send password reset email to ${user.email}?`)) {
      try {
        // Mock API call - replace with real API
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert(`Password reset email sent to ${user.email}`)
      } catch (error) {
        console.error('Error resetting password:', error)
        alert('Failed to send password reset email')
      }
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      role: user.role
    })
    setActiveTab('edit')
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setFormData({ email: '', name: '', role: '' as any })
    setActiveTab('add')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'WORKER': return 'bg-green-100 text-green-800'
      case 'VENDOR': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑'
      case 'MANAGER': return '👔'
      case 'WORKER': return '👷'
      case 'VENDOR': return '🏪'
      default: return '👤'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <AdminOnly fallback={<div className="p-8 text-center text-red-600">Access denied - Admin role required</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Users' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">👥 User Management</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage user accounts and permissions
                  </p>
                </div>
                <button 
                  onClick={handleAddUser}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add User
                </button>
              </div>

              {activeTab === 'view' && (
                <>
                  {loading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-2xl mr-3">{getRoleIcon(user.role)}</div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.name || 'No name'}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.lastLogin 
                                  ? new Date(user.lastLogin).toLocaleDateString()
                                  : 'Never'
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleResetPassword(user)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  Reset Password
                                </button>
                                {user.email !== session.user.email && (
                                  <button 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* User Stats */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">👥 User Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {users.filter(u => u.role === 'ADMIN').length}
                        </div>
                        <div className="text-sm text-red-800">Administrators</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {users.filter(u => u.role === 'MANAGER').length}
                        </div>
                        <div className="text-sm text-blue-800">Managers</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {users.filter(u => u.role === 'WORKER').length}
                        </div>
                        <div className="text-sm text-green-800">Workers</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {users.filter(u => u.role === 'VENDOR').length}
                        </div>
                        <div className="text-sm text-purple-800">Vendors</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(activeTab === 'add' || activeTab === 'edit') && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {activeTab === 'add' ? 'Add New User' : `Edit User: ${selectedUser?.email}`}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedUser(null)
                          setFormData({ email: '', name: '', role: '' as any })
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Users
                      </button>
                    </div>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      
                      try {
                        if (activeTab === 'add') {
                          // Mock API call for adding user
                          const newUser: User = {
                            id: Date.now().toString(),
                            email: formData.email,
                            name: formData.name,
                            role: formData.role,
                            createdAt: new Date().toISOString(),
                            lastLogin: undefined
                          }
                          setUsers(prev => [...prev, newUser])
                          alert('User added successfully!')
                        } else {
                          // Mock API call for editing user
                          setUsers(prev => prev.map(u => 
                            u.id === selectedUser?.id 
                              ? { ...u, name: formData.name, role: formData.role }
                              : u
                          ))
                          alert('User updated successfully!')
                        }
                        
                        setActiveTab('view')
                        setSelectedUser(null)
                        setFormData({ email: '', name: '', role: '' as any })
                      } catch (error) {
                        console.error('Error saving user:', error)
                        alert('Failed to save user')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            disabled={activeTab === 'edit'}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="user@example.com"
                          />
                          {activeTab === 'edit' && (
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role *
                          </label>
                          <select
                            required
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select role...</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="MANAGER">Manager</option>
                            <option value="WORKER">Worker</option>
                            <option value="VENDOR">Vendor</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            {activeTab === 'add' ? 'Add User' : 'Update User'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('view')
                              setSelectedUser(null)
                              setFormData({ email: '', name: '', role: '' as any })
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
} 