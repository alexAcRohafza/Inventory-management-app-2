'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ManagerOrAdmin } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'

interface ReportSummary {
  id: string
  name: string
  description: string
  category: 'inventory' | 'movement' | 'analytics'
  lastGenerated?: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'generate' | 'history'>('view')
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewModal, setViewModal] = useState(false)
  const [viewingReport, setViewingReport] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      // Mock data for now
      setReports([
        { id: '1', name: 'Inventory Summary', description: 'Current stock levels across all locations', category: 'inventory', lastGenerated: new Date().toISOString() },
        { id: '2', name: 'Low Stock Alert', description: 'Items below reorder threshold', category: 'inventory', lastGenerated: new Date().toISOString() },
        { id: '3', name: 'Movement History', description: 'All inventory movements in the last 30 days', category: 'movement', lastGenerated: new Date().toISOString() },
        { id: '4', name: 'Performance Analytics', description: 'Inventory turnover and efficiency metrics', category: 'analytics' }
      ])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handler functions for report actions
  const handleDownloadReport = (reportName: string, date: string) => {
    // Create mock report data
    const reportData = generateMockReportData(reportName)
    const csvContent = convertToCSV(reportData)
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${date}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
    alert('Report downloaded successfully!')
  }

  const handleViewReport = (reportName: string, date: string) => {
    const reportData = generateMockReportData(reportName)
    setViewingReport({ name: reportName, date, data: reportData })
    setViewModal(true)
  }

  const generateMockReportData = (reportName: string) => {
    switch (reportName) {
      case 'Inventory Summary':
        return [
          { Item: 'Widget A', SKU: 'WGT-001', Quantity: 150, Location: 'Zone A', Status: 'In Stock' },
          { Item: 'Widget B', SKU: 'WGT-002', Quantity: 75, Location: 'Zone B', Status: 'Low Stock' },
          { Item: 'Component X', SKU: 'CMP-001', Quantity: 200, Location: 'Zone A', Status: 'In Stock' },
        ]
      case 'Low Stock Alert':
        return [
          { Item: 'Widget B', SKU: 'WGT-002', Quantity: 5, Threshold: 10, Location: 'Zone B' },
          { Item: 'Part Y', SKU: 'PRT-003', Quantity: 2, Threshold: 15, Location: 'Zone C' },
        ]
      case 'Movement History':
        return [
          { Date: '2024-01-15', Item: 'Widget A', Type: 'IN', Quantity: 50, From: 'Supplier', To: 'Zone A' },
          { Date: '2024-01-14', Item: 'Widget B', Type: 'OUT', Quantity: 25, From: 'Zone B', To: 'Customer' },
        ]
      default:
        return [{ Message: 'No data available' }]
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ]
    
    return csvRows.join('\n')
  }

  const handlePagination = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    } else if (direction === 'next') {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleGenerateReport = async (report: ReportSummary) => {
    setGenerating(report.id)
    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update the lastGenerated time
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, lastGenerated: new Date().toISOString() }
          : r
      ))
      
      alert(`${report.name} generated successfully!`)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const handleViewHistory = (report: ReportSummary) => {
    setSelectedReport(report)
    setActiveTab('history')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return '📦'
      case 'movement': return '🔄'
      case 'analytics': return '📊'
      default: return '📄'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'bg-blue-100 text-blue-800'
      case 'movement': return 'bg-green-100 text-green-800'
      case 'analytics': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
    <ManagerOrAdmin fallback={<div className="p-8 text-center text-red-600">Access denied - Manager or Admin role required</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📊 Reports & Analytics</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Generate and view inventory reports and analytics
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Create Custom Report
                </button>
              </div>

              {activeTab === 'view' && (
                <>
                  {loading ? (
                    <div className="text-center py-4">Loading reports...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reports.map((report) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{getCategoryIcon(report.category)}</div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.category)}`}>
                                  {report.category.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                          
                          {report.lastGenerated && (
                            <p className="text-xs text-gray-500 mb-4">
                              Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                            </p>
                          )}
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleGenerateReport(report)}
                              disabled={generating === report.id}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {generating === report.id ? 'Generating...' : 'Generate'}
                            </button>
                            <button 
                              onClick={() => handleViewHistory(report)}
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                            >
                              View History
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Quick Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">247</div>
                        <div className="text-sm text-gray-600">Total Items</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">12</div>
                        <div className="text-sm text-gray-600">Low Stock</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">$45,230</div>
                        <div className="text-sm text-gray-600">Total Value</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">89</div>
                        <div className="text-sm text-gray-600">Movements Today</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'create' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Create Custom Report</h3>
                      <button
                        onClick={() => setActiveTab('view')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Reports
                      </button>
                    </div>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      
                      try {
                        const newReport = {
                          id: Date.now().toString(),
                          name: formData.get('name') as string,
                          description: formData.get('description') as string,
                          category: formData.get('category') as 'inventory' | 'movement' | 'analytics'
                        }
                        
                        setReports(prev => [...prev, newReport])
                        setActiveTab('view')
                        alert('Custom report created successfully!')
                      } catch (error) {
                        console.error('Error creating report:', error)
                        alert('Failed to create report')
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Weekly Sales Report"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief description of what this report will show"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select category...</option>
                            <option value="inventory">Inventory</option>
                            <option value="movement">Movement</option>
                            <option value="analytics">Analytics</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Create Report
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('view')}
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

              {activeTab === 'history' && selectedReport && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Report History: {selectedReport.name}
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('view')
                          setSelectedReport(null)
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Reports
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Mock history entries */}
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedReport.name} - {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Generated at {new Date(Date.now() - i * 86400000).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleDownloadReport(selectedReport.name, new Date(Date.now() - i * 86400000).toLocaleDateString())}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Download
                            </button>
                            <button 
                              onClick={() => handleViewReport(selectedReport.name, new Date(Date.now() - i * 86400000).toLocaleDateString())}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      <div className="flex justify-center pt-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handlePagination('prev')}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border border-gray-300 rounded text-sm transition-colors ${
                              currentPage === 1 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of 3</span>
                          <button 
                            onClick={() => handlePagination('next')}
                            disabled={currentPage >= 3}
                            className={`px-3 py-1 border border-gray-300 rounded text-sm transition-colors ${
                              currentPage >= 3 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Report Modal */}
        {viewModal && viewingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📊 {viewingReport.name} - {viewingReport.date}
                </h3>
                <button
                  onClick={() => setViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(viewingReport.data[0] || {}).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewingReport.data.map((row: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    handleDownloadReport(viewingReport.name, viewingReport.date)
                    setViewModal(false)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  💾 Download CSV
                </button>
                <button
                  onClick={() => setViewModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerOrAdmin>
  )
} 