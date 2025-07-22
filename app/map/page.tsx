'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkerAndUp } from '../components/PermissionGuard'
import { Breadcrumb } from '../components/Navigation'
import QRCode from 'qrcode'

interface MapLocation {
  id: string
  name: string
  x: number
  y: number
  type: 'warehouse' | 'area' | 'storage-unit'
  itemsCount?: number
}

export default function MapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [qrLocation, setQRLocation] = useState<MapLocation | null>(null)
  const [showBulkQRModal, setShowBulkQRModal] = useState(false)
  const [draggedLocation, setDraggedLocation] = useState<MapLocation | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchMapData()
  }, [session, status, router])

  const fetchMapData = async () => {
    try {
      // Mock map data
      setLocations([
        { id: '1', name: 'Main Warehouse', x: 100, y: 80, type: 'warehouse', itemsCount: 247 },
        { id: '2', name: 'Zone A', x: 150, y: 120, type: 'area', itemsCount: 125 },
        { id: '3', name: 'Zone B', x: 250, y: 120, type: 'area', itemsCount: 85 },
        { id: '4', name: 'A-001', x: 180, y: 150, type: 'storage-unit', itemsCount: 45 },
        { id: '5', name: 'A-002', x: 220, y: 150, type: 'storage-unit', itemsCount: 32 },
        { id: '6', name: 'B-001', x: 280, y: 150, type: 'storage-unit', itemsCount: 28 }
      ])
    } catch (error) {
      console.error('Failed to fetch map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return '🏢'
      case 'area': return '📍'
      case 'storage-unit': return '📦'
      default: return '📍'
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'warehouse': return 'bg-blue-500 hover:bg-blue-600'
      case 'area': return 'bg-green-500 hover:bg-green-600'
      case 'storage-unit': return 'bg-purple-500 hover:bg-purple-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  // QR Code Generation
  const generateQRCode = async (location: MapLocation) => {
    try {
      const locationData = {
        id: location.id,
        name: location.name,
        type: location.type,
        url: `${window.location.origin}/map?location=${location.id}`,
        timestamp: new Date().toISOString()
      }
      
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(locationData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQRCodeUrl(qrCodeDataURL)
      setQRLocation(location)
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    }
  }

  // Bulk QR Code Generation
  const generateBulkQRCodes = async () => {
    setShowBulkQRModal(true)
  }

  // Layout Editing Functions
  const handleEditLayout = () => {
    setEditMode(!editMode)
    if (editMode) {
      alert('Layout saved! Changes have been applied.')
    }
  }

  const handleLocationDrag = (location: MapLocation, newX: number, newY: number) => {
    if (editMode) {
      setLocations(prev => prev.map(loc => 
        loc.id === location.id 
          ? { ...loc, x: newX, y: newY }
          : loc
      ))
    }
  }

  // Navigation and View Functions
  const handleViewItems = (location: MapLocation) => {
    // Navigate to items page with location filter
    router.push(`/items?location=${location.id}`)
  }

  const handleNavigateToLocation = (location: MapLocation) => {
    // Center the map on the location and highlight it
    setSelectedLocation(location)
    alert(`Navigation set to ${location.name}. Use mobile app to get turn-by-turn directions.`)
  }

  // Print and Export Functions
  const handlePrintLabels = () => {
    const printContent = locations.map(loc => 
      `${loc.name} (${loc.type.toUpperCase()}) - ID: ${loc.id}`
    ).join('\n')
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Location Labels</title></head>
          <body>
            <h1>Location Labels</h1>
            <pre style="font-family: monospace; font-size: 14px; line-height: 2;">${printContent}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleExportMap = () => {
    const mapData = {
      locations,
      exportDate: new Date().toISOString(),
      format: 'json'
    }
    
    const dataStr = JSON.stringify(mapData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `warehouse-map-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    alert('Map exported successfully!')
  }

  const handleImportLayout = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string)
            if (importedData.locations && Array.isArray(importedData.locations)) {
              setLocations(importedData.locations)
              alert('Layout imported successfully!')
            } else {
              alert('Invalid file format')
            }
          } catch (error) {
            console.error('Error importing layout:', error)
            alert('Failed to import layout')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
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
    <WorkerAndUp fallback={<div className="p-8 text-center text-red-600">Access denied</div>}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Site Map' }
          ]} />

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🗺️ Site Map</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Interactive warehouse layout and item locations
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={generateBulkQRCodes}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    📱 Generate QR Codes
                  </button>
                  <button 
                    onClick={handleEditLayout}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      editMode 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {editMode ? '💾 Save Layout' : '⚙️ Edit Layout'}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading map...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interactive Map */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-100 rounded-lg p-4 h-96 relative border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Facility Layout</h3>
                      
                      {/* Map Canvas */}
                      <div className={`relative w-full h-80 bg-white rounded border-2 transition-colors ${
                        editMode ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
                      }`}>
                        {editMode && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            🖱️ Drag locations to reposition • Click Save when done
                          </div>
                        )}
                        {locations.map((location) => (
                          <div
                            key={location.id}
                            className={`absolute w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 text-white text-xs flex items-center justify-center transition-all ${
                              editMode ? 'cursor-move hover:scale-110' : 'cursor-pointer'
                            } ${getLocationColor(location.type)} ${
                              selectedLocation?.id === location.id ? 'ring-4 ring-yellow-400' : ''
                            }`}
                            style={{ left: `${location.x}px`, top: `${location.y}px` }}
                            onClick={() => !editMode && setSelectedLocation(location)}
                            onMouseDown={(e) => {
                              if (editMode) {
                                setIsDragging(true)
                                setDraggedLocation(location)
                              }
                            }}
                            onMouseMove={(e) => {
                              if (editMode && isDragging && draggedLocation?.id === location.id) {
                                const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                                if (rect) {
                                  const x = e.clientX - rect.left
                                  const y = e.clientY - rect.top
                                  handleLocationDrag(location, Math.max(20, Math.min(x, rect.width - 20)), Math.max(20, Math.min(y, rect.height - 20)))
                                }
                              }
                            }}
                            onMouseUp={() => {
                              setIsDragging(false)
                              setDraggedLocation(null)
                            }}
                            title={`${location.name} ${editMode ? '(drag to move)' : ''}`}
                          >
                            {getLocationIcon(location.type)}
                          </div>
                        ))}
                        
                        {/* Legend */}
                        <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow text-xs">
                          <div className="font-semibold mb-1">Legend</div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span>Warehouse</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span>Area</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                            <span>Storage Unit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Details & QR Codes */}
                  <div className="space-y-4">
                    {selectedLocation ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {getLocationIcon(selectedLocation.type)} {selectedLocation.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>Type:</strong> {selectedLocation.type.replace('-', ' ').toUpperCase()}</p>
                          <p><strong>Items:</strong> {selectedLocation.itemsCount || 0}</p>
                          <p><strong>Coordinates:</strong> ({selectedLocation.x}, {selectedLocation.y})</p>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <button 
                            onClick={() => handleViewItems(selectedLocation)}
                            className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                          >
                            📦 View Items
                          </button>
                          <button 
                            onClick={() => generateQRCode(selectedLocation)}
                            className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors"
                          >
                            📱 Generate QR Code
                          </button>
                          <button 
                            onClick={() => handleNavigateToLocation(selectedLocation)}
                            className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-sm hover:bg-purple-200 transition-colors"
                          >
                            📍 Navigate Here
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p className="text-gray-600">Click on any location in the map to view details</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Quick Actions</h3>
                      <div className="space-y-2">
                        <button 
                          onClick={handlePrintLabels}
                          className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                        >
                          📄 Print Location Labels
                        </button>
                        <button 
                          onClick={generateBulkQRCodes}
                          className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 transition-colors"
                        >
                          📱 Bulk Generate QR Codes
                        </button>
                        <button 
                          onClick={handleImportLayout}
                          className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-sm hover:bg-purple-200 transition-colors"
                        >
                          📥 Import Layout
                        </button>
                        <button 
                          onClick={handleExportMap}
                          className="w-full bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md text-sm hover:bg-yellow-200 transition-colors"
                        >
                          📤 Export Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Features */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📱 QR Code Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-medium text-gray-900">Mobile Scanning</div>
                    <div className="text-xs text-gray-600 mt-1">Scan to view location details</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-sm font-medium text-gray-900">Quick Navigation</div>
                    <div className="text-xs text-gray-600 mt-1">Find items and locations fast</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-sm font-medium text-gray-900">Inventory Updates</div>
                    <div className="text-xs text-gray-600 mt-1">Update stock levels on-site</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm font-medium text-gray-900">Printable Labels</div>
                    <div className="text-xs text-gray-600 mt-1">Generate physical location tags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          {showQRModal && qrLocation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    QR Code: {qrLocation.name}
                  </h3>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="text-center">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for ${qrLocation.name}`}
                    className="mx-auto mb-4 border rounded"
                  />
                  <p className="text-sm text-gray-600 mb-4">
                    {qrLocation.type.toUpperCase()}: {qrLocation.name}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrCodeUrl
                        link.download = `qr-${qrLocation.name.toLowerCase().replace(/\s+/g, '-')}.png`
                        link.click()
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      💾 Download
                    </button>
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank')
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head><title>QR Code - ${qrLocation.name}</title></head>
                              <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif;">
                                <h2>${qrLocation.name}</h2>
                                <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; margin: 20px 0;" />
                                <p>Type: ${qrLocation.type.toUpperCase()}</p>
                                <p>ID: ${qrLocation.id}</p>
                              </body>
                            </html>
                          `)
                          printWindow.document.close()
                          printWindow.print()
                        }
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk QR Code Modal */}
          {showBulkQRModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📱 Bulk QR Code Generation
                  </h3>
                  <button
                    onClick={() => setShowBulkQRModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="border rounded-lg p-3 text-center">
                      <div className="text-lg mb-2">{getLocationIcon(location.type)}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{location.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{location.type.toUpperCase()}</div>
                      <button
                        onClick={() => {
                          generateQRCode(location)
                          setShowBulkQRModal(false)
                        }}
                        className="w-full bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                      >
                        Generate QR
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={async () => {
                      // Generate all QR codes and create a printable page
                      const qrCodes = await Promise.all(
                        locations.map(async (location) => {
                          const locationData = {
                            id: location.id,
                            name: location.name,
                            type: location.type,
                            url: `${window.location.origin}/map?location=${location.id}`,
                            timestamp: new Date().toISOString()
                          }
                          
                          const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(locationData), {
                            width: 150,
                            margin: 1
                          })
                          
                          return { location, qrCode: qrCodeDataURL }
                        })
                      )
                      
                      const printWindow = window.open('', '_blank')
                      if (printWindow) {
                        const qrHTML = qrCodes.map(({ location, qrCode }) => `
                          <div style="display: inline-block; margin: 10px; text-align: center; page-break-inside: avoid;">
                            <h4>${location.name}</h4>
                            <img src="${qrCode}" alt="QR Code for ${location.name}" />
                            <p style="font-size: 12px; margin: 5px 0;">${location.type.toUpperCase()}</p>
                            <p style="font-size: 10px; color: #666;">${location.id}</p>
                          </div>
                        `).join('')
                        
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Bulk QR Codes</title>
                              <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                h1 { text-align: center; margin-bottom: 30px; }
                                .qr-grid { display: flex; flex-wrap: wrap; justify-content: center; }
                              </style>
                            </head>
                            <body>
                              <h1>Location QR Codes</h1>
                              <div class="qr-grid">${qrHTML}</div>
                            </body>
                          </html>
                        `)
                        printWindow.document.close()
                        printWindow.print()
                      }
                      
                      setShowBulkQRModal(false)
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    🖨️ Generate All & Print
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkerAndUp>
  )
} 