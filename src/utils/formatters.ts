import { format, formatDistanceToNow } from 'date-fns'
import { AssetType, AssetStatus, EventType, EventSeverity } from '../types'

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'PPP p')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function getAssetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    'signal-main': 'Main Signal',
    'signal-distant': 'Distant Signal',
    'signal-shunting': 'Shunting Signal',
    'balise-fixed': 'Fixed Balise',
    'balise-switchable': 'Switchable Balise',
    'balise-infill': 'Infill Balise',
    'axle-counter-head': 'Axle Counter Head',
    'axle-counter-evaluator': 'Axle Counter Evaluator',
    'switch': 'Switch/Points',
    'level-crossing': 'Level Crossing',
    'radio-block-center': 'Radio Block Center',
  }
  return labels[type] || type
}

export function getAssetStatusLabel(status: AssetStatus): string {
  const labels: Record<AssetStatus, string> = {
    operational: 'Operational',
    maintenance: 'Maintenance',
    fault: 'Fault',
    offline: 'Offline',
  }
  return labels[status] || status
}

export function getAssetStatusColor(status: AssetStatus): string {
  const colors: Record<AssetStatus, string> = {
    operational: 'text-green-500',
    maintenance: 'text-yellow-500',
    fault: 'text-red-500',
    offline: 'text-gray-500',
  }
  return colors[status] || 'text-gray-500'
}

export function getAssetStatusBgColor(status: AssetStatus): string {
  const colors: Record<AssetStatus, string> = {
    operational: 'bg-green-500/10 border-green-500/20',
    maintenance: 'bg-yellow-500/10 border-yellow-500/20',
    fault: 'bg-red-500/10 border-red-500/20',
    offline: 'bg-gray-500/10 border-gray-500/20',
  }
  return colors[status] || 'bg-gray-500/10 border-gray-500/20'
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    installation: 'Installation',
    maintenance: 'Maintenance',
    fault: 'Fault',
    repair: 'Repair',
    inspection: 'Inspection',
    'status-change': 'Status Change',
    'software-update': 'Software Update',
    'communication-failure': 'Communication Failure',
    'hardware-fault': 'Hardware Fault',
    environmental: 'Environmental',
    'power-issue': 'Power Issue',
  }
  return labels[type] || type
}

export function getSeverityLabel(severity: EventSeverity): string {
  const labels: Record<EventSeverity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
  }
  return labels[severity] || severity
}

export function getSeverityColor(severity: EventSeverity): string {
  const colors: Record<EventSeverity, string> = {
    critical: 'text-red-600',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500',
    info: 'text-gray-500',
  }
  return colors[severity] || 'text-gray-500'
}

export function getSeverityBgColor(severity: EventSeverity): string {
  const colors: Record<EventSeverity, string> = {
    critical: 'bg-red-500/10 border-red-500/20',
    high: 'bg-orange-500/10 border-orange-500/20',
    medium: 'bg-yellow-500/10 border-yellow-500/20',
    low: 'bg-blue-500/10 border-blue-500/20',
    info: 'bg-gray-500/10 border-gray-500/20',
  }
  return colors[severity] || 'bg-gray-500/10 border-gray-500/20'
}

export function getAssetTypeIcon(type: AssetType): string {
  const icons: Record<AssetType, string> = {
    'signal-main': '🚦',
    'signal-distant': '🚥',
    'signal-shunting': '🔶',
    'balise-fixed': '📍',
    'balise-switchable': '🔀',
    'balise-infill': '📌',
    'axle-counter-head': '⚙️',
    'axle-counter-evaluator': '🖥️',
    'switch': '🔄',
    'level-crossing': '⚠️',
    'radio-block-center': '📡',
  }
  return icons[type] || '📦'
}

export function getAssetMarkerColor(status: AssetStatus): string {
  const colors: Record<AssetStatus, string> = {
    operational: '#22c55e', // green
    maintenance: '#eab308', // yellow
    fault: '#ef4444', // red
    offline: '#6b7280', // gray
  }
  return colors[status] || '#6b7280'
}
