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
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit' | 'contact' | 'items'>('view')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    contact: '', 
    email: '', 
    address: '' 
  })
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<'email' | 'call' | 'quote'>('email')

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

  // Vendor contact handlers
  const handleSendEmail = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setContactType('email')
    setShowContactModal(true)
  }

  const handleScheduleCall = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setContactType('call')
    setShowContactModal(true)
  }

  const handleRequestQuote = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setContactType('quote')
    setShowContactModal(true)
  }

  const processContactAction = () => {
    if (!selectedVendor) return
    
    switch (contactType) {
      case 'email':
        // Create mailto link
        const subject = `Inquiry from ${session?.user?.name || 'Inventory System'}`
        const body = `Hello ${selectedVendor.contact},\n\nI would like to discuss our inventory needs.\n\nBest regards,\n${session?.user?.name || 'Team'}`
        window.open(`mailto:${selectedVendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
        break
        
      case 'call':
        // Show phone number for calling
        alert(`Please call ${selectedVendor.contact} at: [Phone number to be configured]`)
        break
        
      case 'quote':
        // Create quote request
        alert(`Quote request prepared for ${selectedVendor.name}. This will be sent via your preferred communication method.`)
        break
    }
    
    setShowContactModal(false)
    setSelectedVendor(null)
  }

  const handleAddVendor = () => {
    setSelectedVendor(null)
    setFormData({ name: '', contact: '', email: '', address: '' })
    setActiveTab('add')
  }

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name,
      contact: vendor.contact,
      email: vendor.email || '',
      address: vendor.address || ''
    })
    setActiveTab('edit')
  }

  const handleContactVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setActiveTab('contact')
  }

  const handleViewItems = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setActiveTab('items')
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
                  <button 
                    onClick={handleAddVendor}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Add Vendor
                  </button>
                )}
              </div>

              {activeTab === 'view' && (
                <>
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
                            <button 
                              onClick={() => handleViewItems(vendor)}
                              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                            >
                              View Items
                            </button>
                            <button 
                              onClick={() => handleContactVendor(vendor)}
                              className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors"
                            >
                              Contact
                            </button>
                            {canEdit && (
                              <button 
                                onClick={() => handleEditVendor(vendor)}
                                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                              >
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
                      <button 
                        onClick={() => setActiveTab('items')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View My Items
                      </button>
                    </div>
                  )}
                </>
              )}

              {(activeTab === 'add' || activeTab === 'edit') && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {activeTab === 'add' ? 'Add New Vendor' : `Edit Vendor: ${selectedVendor?.name}`}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedVendor(null)
                          setFormData({ name: '', contact: '', email: '', address: '' })
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Vendors
                      </button>
                    </div>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      
                      try {
                        if (activeTab === 'add') {
                          const newVendor: Vendor = {
                            id: Date.now().toString(),
                            name: formData.name,
                            contact: formData.contact,
                            email: formData.email || undefined,
                            address: formData.address || undefined,
                            itemsSupplied: 0,
                            lastOrder: undefined
                          }
                          setVendors(prev => [...prev, newVendor])
                          alert('Vendor added successfully!')
                        } else {
                          setVendors(prev => prev.map(v => 
                            v.id === selectedVendor?.id 
                              ? { 
                                  ...v, 
                                  name: formData.name,
                                  contact: formData.contact,
                                  email: formData.email || undefined,
                                  address: formData.address || undefined
                                }
                              : v
                          ))
                          alert('Vendor updated successfully!')
                        }
                        
                        setActiveTab('view')
                        setSelectedVendor(null)
                        setFormData({ name: '', contact: '', email: '', address: '' })
                      } catch (error) {
                        console.error('Error saving vendor:', error)
                        alert('Failed to save vendor')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vendor Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., ABC Supplies Co."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., John Smith"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="contact@vendor.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123 Business St, City, State 12345"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            {activeTab === 'add' ? 'Add Vendor' : 'Update Vendor'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('view')
                              setSelectedVendor(null)
                              setFormData({ name: '', contact: '', email: '', address: '' })
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

              {activeTab === 'contact' && selectedVendor && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Contact: {selectedVendor.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedVendor(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Vendors
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                        <div className="space-y-2">
                          <p><strong>Contact Person:</strong> {selectedVendor.contact}</p>
                          {selectedVendor.email && <p><strong>Email:</strong> {selectedVendor.email}</p>}
                          {selectedVendor.address && <p><strong>Address:</strong> {selectedVendor.address}</p>}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleSendEmail(selectedVendor)}
                          className="w-full bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          📧 Send Email
                        </button>
                        <button 
                          onClick={() => handleScheduleCall(selectedVendor)}
                          className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          📞 Schedule Call
                        </button>
                        <button 
                          onClick={() => handleRequestQuote(selectedVendor)}
                          className="w-full bg-purple-100 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          📄 Request Quote
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'items' && selectedVendor && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Items from: {selectedVendor.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedVendor(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Vendors
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mock vendor items */}
                      {Array.from({ length: selectedVendor.itemsSupplied || 3 }, (_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">Product {i + 1}</h4>
                          <p className="text-sm text-gray-600 mt-1">SKU: VEN-{selectedVendor.id}-{i + 1}</p>
                          <p className="text-sm text-gray-600">Stock: {Math.floor(Math.random() * 100) + 10}</p>
                          <p className="text-sm text-blue-600 font-medium mt-2">${(Math.random() * 100 + 10).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Modal */}
        {showContactModal && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contactType === 'email' && '📧 Send Email'}
                  {contactType === 'call' && '📞 Schedule Call'}
                  {contactType === 'quote' && '📄 Request Quote'}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{selectedVendor.name}</h4>
                  <p className="text-sm text-gray-600">Contact: {selectedVendor.contact}</p>
                  {selectedVendor.email && (
                    <p className="text-sm text-gray-600">Email: {selectedVendor.email}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                {contactType === 'email' && (
                  <p className="text-sm text-gray-600">
                    This will open your email client with a pre-filled message to {selectedVendor.name}.
                  </p>
                )}
                {contactType === 'call' && (
                  <p className="text-sm text-gray-600">
                    This will provide you with the contact information to schedule a call with {selectedVendor.name}.
                  </p>
                )}
                {contactType === 'quote' && (
                  <p className="text-sm text-gray-600">
                    This will prepare a quote request for {selectedVendor.name} based on your current inventory needs.
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={processContactAction}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {contactType === 'email' && 'Open Email Client'}
                  {contactType === 'call' && 'Show Contact Info'}
                  {contactType === 'quote' && 'Prepare Quote'}
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorAccess>
  )
} 