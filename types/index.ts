export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
  VENDOR = 'VENDOR'
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  STOCK_UPDATED = 'stock_updated',
  ITEM_ADDED = 'item_added',
  ITEM_REMOVED = 'item_removed',
  INVENTORY_MOVEMENT = 'inventory_movement',
  SYSTEM_ALERT = 'system_alert'
}

export interface NotificationData {
  id: string
  type: NotificationType
  userId: string
  message: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
  supplier: string
  lastUpdated: Date
}

// CSV and Reporting types
export interface CSVUploadResult {
  totalRows: number
  validRows: number
  importedRows: number
  errors: CSVValidationError[]
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
  value?: any
}

export interface ReportType {
  id: string
  name: string
  description: string
  category: 'inventory' | 'movement' | 'analytics'
}

export interface ReportFilter {
  locationId?: string
  areaId?: string
  storageUnitId?: string
  lowStockThreshold?: number
  dateFrom?: Date
  dateTo?: Date
  category?: string
}

export interface LocationHierarchy {
  locations: Location[]
  areas: Area[]
  storageUnits: StorageUnit[]
}

export interface Location {
  id: string
  name: string
  address: string
}

export interface Area {
  id: string
  name: string
  locationId: string
  locationName?: string
}

export interface StorageUnit {
  id: string
  name: string
  areaId: string
  areaName?: string
  locationName?: string
}

export interface DetailedInventoryItem {
  id: string
  name: string
  description?: string
  quantity: number
  price?: number
  sku?: string
  locationName: string
  areaName: string
  storageUnitName: string
  lastMovementDate?: Date
  isLowStock: boolean
}

// AI Analysis Types
export interface AnalysisRequest {
  reportType: 'inventory' | 'low-stock' | 'movements' | 'locations' | 'analytics'
  data: any[]
  question?: string
  analysisType: 'summary' | 'forecast' | 'risks' | 'insights' | 'custom'
}

export interface AnalysisResponse {
  analysis: string
  keyInsights: string[]
  recommendations: string[]
  riskFactors?: string[]
  forecastData?: any
} 