'use client'

import { useState, useRef } from 'react'
import { CSVUploadResult, CSVValidationError } from '@/types'

interface CSVUploaderProps {
  onUploadSuccess?: (result: CSVUploadResult) => void
  onUploadError?: (error: string) => void
  className?: string
}

export default function CSVUploader({ 
  onUploadSuccess, 
  onUploadError, 
  className = '' 
}: CSVUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null)
  const [showTemplate, setShowTemplate] = useState(false)
  const [templateData, setTemplateData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      const result: CSVUploadResult = await response.json()

      if (response.ok) {
        setUploadResult(result)
        if (onUploadSuccess) {
          onUploadSuccess(result)
        }
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Upload failed'
        setUploadResult(result)
        if (onUploadError) {
          onUploadError(errorMessage)
        }
      }
    } catch (error: any) {
      const errorMessage = `Upload failed: ${error.message}`
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const fetchTemplate = async () => {
    try {
      const response = await fetch('/api/import')
      const template = await response.json()
      setTemplateData(template)
      setShowTemplate(true)
    } catch (error) {
      console.error('Failed to fetch template:', error)
    }
  }

  const downloadTemplate = () => {
    if (!templateData?.sampleData) return

    const csvContent = [
      // Header row
      Object.keys(templateData.sampleData[0]).join(','),
      // Data rows
      ...templateData.sampleData.map((row: any) => 
        Object.values(row).map((value: any) => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFile) {
      await uploadFile(csvFile)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">📁</div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="text-lg font-medium text-blue-600">Uploading...</div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-700">
                Drop CSV file here or click to browse
              </div>
              <div className="text-sm text-gray-500">
                Supported format: .csv files only
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select File
            </button>
            
            <button
              onClick={fetchTemplate}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              View Format
            </button>
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`p-4 rounded-md ${
          uploadResult.errors.length === 0 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <h3 className="font-semibold text-lg mb-2">Upload Results</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-xl">{uploadResult.totalRows}</div>
              <div className="text-gray-600">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-green-600">{uploadResult.importedRows}</div>
              <div className="text-gray-600">Imported</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-red-600">{uploadResult.errors.length}</div>
              <div className="text-gray-600">Errors</div>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-700">Errors encountered:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {uploadResult.errors.map((error: CSVValidationError, index: number) => (
                  <div key={index} className="text-sm bg-red-50 p-2 rounded border">
                    <span className="font-medium">Row {error.row}</span>
                    {error.field && <span className="text-gray-600"> ({error.field})</span>}: 
                    <span className="text-red-700 ml-1">{error.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Modal */}
      {showTemplate && templateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">CSV Format Template</h3>
              <button
                onClick={() => setShowTemplate(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Required Fields */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Required Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {templateData.requiredFields.map((field: string) => (
                    <span key={field} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Optional Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {templateData.optionalFields.map((field: string) => (
                    <span key={field} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Sample Data</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(templateData.sampleData[0]).map((header: string) => (
                          <th key={header} className="border border-gray-200 px-3 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {templateData.sampleData.map((row: any, index: number) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex: number) => (
                            <td key={cellIndex} className="border border-gray-200 px-3 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Important Notes</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {templateData.notes.map((note: string, index: number) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download Template
                </button>
                <button
                  onClick={() => setShowTemplate(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 