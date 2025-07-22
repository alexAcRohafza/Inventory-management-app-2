'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { VendorAccess } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface Vendor {
  id: string
  name: string
  contact: string
  email?: string
  address?: string
  itemsSupplied?: number
  lastOrder?: string
}

export default function VendorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchVendors()
  }, [session, status, router])

  const fetchVendors = async () => {
    try {
      // Mock data for now
      setVendors([
        { 
          id: '1', 
          name: 'ABC Supplies Co.', 
          contact: 'John Smith', 
          email: 'john@abcsupplies.com',
          address: '123 Business St, City, ST 12345',
          itemsSupplied: 45,
          lastOrder: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        { 
          id: '2', 
          name: 'Tech Components Ltd.', 
          contact: 'Sarah Johnson', 
          email: 'sarah@techcomponents.com',
          address: '456 Tech Ave, City, ST 12345',
          itemsSupplied: 23,
          lastOrder: new Date(Date.now() - 86400000 * 7).toISOString()
        },
        { 
          id: '3', 
          name: 'Global Parts Inc.', 
          contact: 'Mike Wilson', 
          email: 'mike@globalparts.com',
          address: '789 Parts Blvd, City, ST 12345',
          itemsSupplied: 67,
          lastOrder: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const userRole = session?.user?.role
  const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER'

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <VendorAccess fallback={<div className="p-8 text-center text-red-600">Access denied</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Vendors' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🏪 Vendors</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {userRole === 'VENDOR' 
                      ? 'View your vendor information and supplied items'
                      : 'Manage vendor relationships and contacts'
                    }
                  </p>
                </div>
                {canEdit && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    + Add Vendor
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-4">Loading vendors...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🏪</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                            <p className="text-sm text-gray-600">Contact: {vendor.contact}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {vendor.itemsSupplied} items supplied
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {vendor.email && (
                          <p className="text-sm text-gray-600">
                            📧 {vendor.email}
                          </p>
                        )}
                        {vendor.address && (
                          <p className="text-sm text-gray-600">
                            📍 {vendor.address}
                          </p>
                        )}
                        {vendor.lastOrder && (
                          <p className="text-sm text-gray-600">
                            📅 Last order: {new Date(vendor.lastOrder).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
                          View Items
                        </button>
                        <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors">
                          Contact
                        </button>
                        {canEdit && (
                          <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userRole === 'VENDOR' && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">🏪 Vendor Portal</h3>
                  <p className="text-blue-800 mb-4">
                    As a vendor, you can view your supplied items and track their inventory levels.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    View My Items
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </VendorAccess>
  )
} 