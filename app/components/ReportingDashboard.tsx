'use client'

import { useState, useEffect } from 'react'
import CSVUploader from './CSVUploader'
import { DetailedInventoryItem, ReportFilter, LocationHierarchy, CSVUploadResult } from '@/types'

interface ReportingDashboardProps {
  className?: string
}

export default function ReportingDashboard({ className = '' }: ReportingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'import' | 'export'>('reports')
  const [reportType, setReportType] = useState<'inventory' | 'low-stock' | 'movements' | 'locations'>('inventory')
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ReportFilter>({
    lowStockThreshold: 10
  })
  const [locationHierarchy, setLocationHierarchy] = useState<LocationHierarchy | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch location hierarchy for filters
  useEffect(() => {
    fetchLocationHierarchy()
  }, [])

  const fetchLocationHierarchy = async () => {
    try {
      const response = await fetch('/api/reports?type=locations')
      const data = await response.json()
      
      // Transform the data into the expected format
      const hierarchy: LocationHierarchy = {
        locations: data.data || [],
        areas: data.data?.flatMap((loc: any) => loc.areas || []) || [],
        storageUnits: data.data?.flatMap((loc: any) => 
          loc.areas?.flatMap((area: any) => area.storageUnits || []) || []
        ) || []
      }
      
      setLocationHierarchy(hierarchy)
    } catch (error) {
      console.error('Failed to fetch location hierarchy:', error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: 'json'
      })

      // Add filters to params
      if (filters.locationId) params.append('locationId', filters.locationId)
      if (filters.areaId) params.append('areaId', filters.areaId)
      if (filters.storageUnitId) params.append('storageUnitId', filters.storageUnitId)
      if (filters.lowStockThreshold) params.append('lowStockThreshold', filters.lowStockThreshold.toString())
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())

      const response = await fetch(`/api/reports?${params}`)
      const result = await response.json()

      if (response.ok) {
        setReportData(result.data || [])
      } else {
        console.error('Report generation failed:', result.error)
      }
    } catch (error) {
      console.error('Report generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: 'csv'
      })

      // Add filters to params
      if (filters.locationId) params.append('locationId', filters.locationId)
      if (filters.areaId) params.append('areaId', filters.areaId)
      if (filters.storageUnitId) params.append('storageUnitId', filters.storageUnitId)
      if (filters.lowStockThreshold) params.append('lowStockThreshold', filters.lowStockThreshold.toString())
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())

      const response = await fetch(`/api/reports?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleUploadSuccess = (result: CSVUploadResult) => {
    console.log('Upload successful:', result)
    // Optionally refresh reports or show success message
  }

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'reports', label: 'Reports & Analytics', icon: '📊' },
            { id: 'import', label: 'CSV Import', icon: '📥' },
            { id: 'export', label: 'Data Export', icon: '📤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Report Type:</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="inventory">Full Inventory</option>
                  <option value="low-stock">Low Stock Items</option>
                  <option value="movements">Movement History</option>
                  <option value="locations">Location Structure</option>
                </select>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Export to CSV
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Filter Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      value={filters.locationId || ''}
                      onChange={(e) => setFilters({ ...filters, locationId: e.target.value || undefined, areaId: undefined, storageUnitId: undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Locations</option>
                      {locationHierarchy?.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area
                    </label>
                    <select
                      value={filters.areaId || ''}
                      onChange={(e) => setFilters({ ...filters, areaId: e.target.value || undefined, storageUnitId: undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      disabled={!filters.locationId}
                    >
                      <option value="">All Areas</option>
                      {locationHierarchy?.areas
                        .filter(area => !filters.locationId || area.locationId === filters.locationId)
                        .map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Storage Unit Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Unit
                    </label>
                    <select
                      value={filters.storageUnitId || ''}
                      onChange={(e) => setFilters({ ...filters, storageUnitId: e.target.value || undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      disabled={!filters.areaId}
                    >
                      <option value="">All Storage Units</option>
                      {locationHierarchy?.storageUnits
                        .filter(unit => !filters.areaId || unit.areaId === filters.areaId)
                        .map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Low Stock Threshold */}
                  {reportType === 'low-stock' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        value={filters.lowStockThreshold || 10}
                        onChange={(e) => setFilters({ ...filters, lowStockThreshold: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Date Range for Movements */}
                  {reportType === 'movements' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Report Results */}
            {reportData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">
                    {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')} Report
                    <span className="ml-2 text-sm text-gray-500">({reportData.length} records)</span>
                  </h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {reportType === 'inventory' || reportType === 'low-stock' ? (
                          <>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Quantity</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Location</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Storage Unit</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                          </>
                        ) : reportType === 'movements' ? (
                          <>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Item</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Quantity</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">From/To</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Location</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Areas</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Storage Units</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {reportType === 'inventory' || reportType === 'low-stock' ? (
                            <>
                              <td className="px-4 py-3 text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-gray-900">
                                <span className={item.quantity <= 10 ? 'text-red-600 font-medium' : ''}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{item.locationName}</td>
                              <td className="px-4 py-3 text-gray-700">{item.storageUnitName}</td>
                              <td className="px-4 py-3">
                                {item.isLowStock ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    In Stock
                                  </span>
                                )}
                              </td>
                            </>
                          ) : reportType === 'movements' ? (
                            <>
                              <td className="px-4 py-3 text-gray-900">{item.itemName}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.movementType === 'IN' ? 'bg-green-100 text-green-800' :
                                  item.movementType === 'OUT' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.movementType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {new Date(item.movementDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-gray-700 text-xs">
                                {item.fromStorageUnit && `From: ${item.fromStorageUnit}`}
                                {item.toStorageUnit && `To: ${item.toStorageUnit}`}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-gray-900 font-medium">{item.name}</td>
                              <td className="px-4 py-3 text-gray-700">{item.areas?.length || 0}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.areas?.reduce((sum: number, area: any) => sum + (area.storageUnits?.length || 0), 0) || 0}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Inventory from CSV</h3>
            <CSVUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'inventory', title: 'Full Inventory Export', description: 'Export all items with locations and stock levels', icon: '📦' },
                { type: 'low-stock', title: 'Low Stock Report', description: 'Export items below stock threshold', icon: '⚠️' },
                { type: 'movements', title: 'Movement History', description: 'Export inventory movement records', icon: '🔄' },
                { type: 'locations', title: 'Location Structure', description: 'Export location and storage hierarchy', icon: '🏢' }
              ].map((exportType) => (
                <div key={exportType.type} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{exportType.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{exportType.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{exportType.description}</p>
                      <button
                        onClick={() => {
                          setReportType(exportType.type as any)
                          exportToCSV()
                        }}
                        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 