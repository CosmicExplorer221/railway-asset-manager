// Asset Types
export type AssetType =
  | 'signal-main'
  | 'signal-distant'
  | 'signal-shunting'
  | 'balise-fixed'
  | 'balise-switchable'
  | 'balise-infill'
  | 'axle-counter-head'
  | 'axle-counter-evaluator'
  | 'switch'
  | 'level-crossing'
  | 'radio-block-center'

export type AssetStatus = 'operational' | 'maintenance' | 'fault' | 'offline'

export interface Asset {
  id?: number
  type: AssetType
  name: string
  description: string
  latitude: number
  longitude: number
  status: AssetStatus
  manufacturer: string
  model: string
  serialNumber: string
  installationDate: Date
  lastMaintenanceDate: Date
  nextMaintenanceDue: Date
  lineNumber: string
  kilometer: number
  technicalSpecs: Record<string, string | number>
  relatedAssets: number[] // IDs of related assets
  createdAt: Date
  updatedAt: Date
}

// Event Types
export type EventType =
  | 'installation'
  | 'maintenance'
  | 'fault'
  | 'repair'
  | 'inspection'
  | 'status-change'
  | 'software-update'
  | 'communication-failure'
  | 'hardware-fault'
  | 'environmental'
  | 'power-issue'

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Event {
  id?: number
  assetId: number
  type: EventType
  severity: EventSeverity
  title: string
  description: string
  timestamp: Date
  resolvedAt?: Date
  triggeredBy: 'system' | 'user' | 'automatic'
  metadata: Record<string, any>
  relatedEvents: number[] // IDs of related events
}

// Alert Types
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'

export interface Alert {
  id?: number
  assetId: number
  eventId: number
  severity: EventSeverity
  title: string
  description: string
  status: AlertStatus
  createdAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  resolvedBy?: string
}

// Filter Types
export interface AssetFilter {
  types?: AssetType[]
  statuses?: AssetStatus[]
  lineNumber?: string
  searchQuery?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface EventFilter {
  types?: EventType[]
  severities?: EventSeverity[]
  assetIds?: number[]
  dateRange?: {
    from: Date
    to: Date
  }
}

// Statistics Types
export interface AssetStatistics {
  total: number
  byType: Record<AssetType, number>
  byStatus: Record<AssetStatus, number>
  operationalPercentage: number
  faultCount: number
  maintenanceDue: number
}

export interface EventStatistics {
  total: number
  byType: Record<EventType, number>
  bySeverity: Record<EventSeverity, number>
  recentEvents: Event[]
  averageResolutionTime: number
}

// Report Types
export type ReportType =
  | 'asset-inventory'
  | 'fault-analysis'
  | 'maintenance-schedule'
  | 'uptime-availability'
  | 'event-summary'

export interface ReportConfig {
  type: ReportType
  dateRange: {
    from: Date
    to: Date
  }
  assetTypes?: AssetType[]
  includeCharts: boolean
  format: 'pdf' | 'excel' | 'csv'
}

// Map Types
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MarkerCluster {
  count: number
  latitude: number
  longitude: number
  assets: Asset[]
}

// Timeline Types
export interface TimelineItem {
  id: number
  timestamp: Date
  type: EventType
  severity: EventSeverity
  title: string
  description: string
  assetId: number
  assetName: string
}

// Export/Import Types
export interface ExportData {
  assets: Asset[]
  events: Event[]
  alerts: Alert[]
  exportedAt: Date
  version: string
}

export interface ImportResult {
  success: boolean
  assetsImported: number
  eventsImported: number
  alertsImported: number
  errors: string[]
}
