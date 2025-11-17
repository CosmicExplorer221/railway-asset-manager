import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { assetOperations, eventOperations } from '../../db/operations'
import { Asset } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
  getAssetTypeLabel,
  getAssetStatusLabel,
  getAssetStatusColor,
  getAssetStatusBgColor,
  getEventTypeLabel,
  getSeverityColor,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '../../utils/formatters'
import { ArrowLeft, MapPin, Calendar, Wrench, Activity, AlertCircle } from 'lucide-react'

interface AssetDetailProps {
  assetId: number
  onClose: () => void
}

export default function AssetDetail({ assetId, onClose }: AssetDetailProps) {
  const asset = useLiveQuery(() => assetOperations.getById(assetId), [assetId])
  const events = useLiveQuery(() => eventOperations.getByAssetId(assetId), [assetId])
  const [relatedAssets, setRelatedAssets] = useState<Asset[]>([])

  useEffect(() => {
    async function loadRelatedAssets() {
      if (asset && asset.relatedAssets && asset.relatedAssets.length > 0) {
        const related = await assetOperations.getByIds(asset.relatedAssets)
        setRelatedAssets(related)
      }
    }
    loadRelatedAssets()
  }, [asset])

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const recentEvents = events?.slice(0, 10) || []
  const faultEvents = events?.filter((e) => e.type === 'fault' || e.type === 'hardware-fault' || e.type === 'communication-failure') || []
  const maintenanceEvents = events?.filter((e) => e.type === 'maintenance') || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{asset.name}</h1>
          <p className="text-muted-foreground mt-1">{asset.description}</p>
        </div>
        <Badge variant="outline" className={getAssetStatusBgColor(asset.status)}>
          <span className={getAssetStatusColor(asset.status)}>
            {getAssetStatusLabel(asset.status)}
          </span>
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asset Type</p>
                <Badge variant="outline">{getAssetTypeLabel(asset.type)}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
                <p className="font-mono">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                <p className="font-medium">{asset.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model</p>
                <p className="font-medium">{asset.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Line Number</p>
                <p className="font-medium">{asset.lineNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-mono">km {asset.kilometer.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Events</span>
              </div>
              <span className="font-bold text-lg">{events?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Faults</span>
              </div>
              <span className="font-bold text-lg text-red-500">{faultEvents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Maintenance</span>
              </div>
              <span className="font-bold text-lg text-yellow-500">{maintenanceEvents.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates and Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Installation Date</p>
              <p className="font-medium">{formatDate(asset.installationDate)}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(asset.installationDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Maintenance</p>
              <p className="font-medium">{formatDate(asset.lastMaintenanceDate)}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(asset.lastMaintenanceDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Maintenance Due</p>
              <p className="font-medium">{formatDate(asset.nextMaintenanceDue)}</p>
              <p className={`text-xs ${new Date(asset.nextMaintenanceDue) < new Date() ? 'text-red-500' : 'text-muted-foreground'}`}>
                {new Date(asset.nextMaintenanceDue) < new Date() ? 'OVERDUE' : formatRelativeTime(asset.nextMaintenanceDue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Coordinates</p>
              <p className="font-mono text-sm">
                {asset.latitude.toFixed(6)}, {asset.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Railway Line</p>
              <p className="font-medium">{asset.lineNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kilometer Point</p>
              <p className="font-mono font-medium">km {asset.kilometer.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(asset.technicalSpecs).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest {recentEvents.length} events for this asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className={`mt-0.5 ${getSeverityColor(event.severity)}`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatDateTime(event.timestamp)}</span>
                      {event.resolvedAt && (
                        <span className="text-green-500">
                          ✓ Resolved {formatRelativeTime(event.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No events recorded for this asset</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Assets */}
      {relatedAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Assets</CardTitle>
            <CardDescription>Assets with dependencies or connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedAssets.map((related) => (
                <div key={related.id} className="p-3 border border-border rounded-lg hover:bg-muted/50">
                  <p className="font-medium">{related.name}</p>
                  <p className="text-sm text-muted-foreground">{getAssetTypeLabel(related.type)}</p>
                  <Badge variant="outline" className={`mt-2 ${getAssetStatusBgColor(related.status)}`}>
                    <span className={getAssetStatusColor(related.status)}>
                      {getAssetStatusLabel(related.status)}
                    </span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
