import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { alertOperations } from '../../db/operations'
import { Alert, AlertStatus } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
  getSeverityLabel,
  getSeverityColor,
  getSeverityBgColor,
  
  formatRelativeTime,
} from '../../utils/formatters'
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react'

export default function Alerts() {
  const allAlerts = useLiveQuery(() => db.alerts.orderBy('createdAt').reverse().toArray())
  const assets = useLiveQuery(() => db.assets.toArray())

  const [selectedTab, setSelectedTab] = useState<AlertStatus | 'all'>('active')
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])

  useEffect(() => {
    if (!allAlerts) {
      setFilteredAlerts([])
      return
    }

    if (selectedTab === 'all') {
      setFilteredAlerts(allAlerts)
    } else {
      setFilteredAlerts(allAlerts.filter((alert) => alert.status === selectedTab))
    }
  }, [allAlerts, selectedTab])

  const handleAcknowledge = async (alertId: number) => {
    await alertOperations.acknowledge(alertId, 'current.user')
  }

  const handleResolve = async (alertId: number) => {
    await alertOperations.resolve(alertId, 'current.user')
  }

  const getAssetName = (assetId: number): string => {
    const asset = assets?.find((a) => a.id === assetId)
    return asset?.name || `Asset #${assetId}`
  }

  if (!allAlerts || !assets) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeCount = allAlerts.filter((a) => a.status === 'active').length
  const acknowledgedCount = allAlerts.filter((a) => a.status === 'acknowledged').length
  const resolvedCount = allAlerts.filter((a) => a.status === 'resolved').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage system alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-4xl">{allAlerts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Bell className="mr-2 h-4 w-4" />
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-4xl text-red-500">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              Requiring attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-4xl text-yellow-500">{acknowledgedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Bell className="mr-2 h-4 w-4 text-yellow-500" />
              In progress
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-4xl text-green-500">{resolvedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('all')}
            >
              All ({allAlerts.length})
            </Button>
            <Button
              variant={selectedTab === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('active')}
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={selectedTab === 'acknowledged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('acknowledged')}
            >
              Acknowledged ({acknowledgedCount})
            </Button>
            <Button
              variant={selectedTab === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('resolved')}
            >
              Resolved ({resolvedCount})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Severity Icon */}
                  <div className={`mt-1 ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getSeverityBgColor(alert.severity)}
                      >
                        <span className={getSeverityColor(alert.severity)}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        {getAssetName(alert.assetId)}
                      </span>
                      <span>Created {formatRelativeTime(alert.createdAt)}</span>
                      {alert.acknowledgedAt && (
                        <span className="text-yellow-500">
                          Acknowledged by {alert.acknowledgedBy} {formatRelativeTime(alert.acknowledgedAt)}
                        </span>
                      )}
                      {alert.resolvedAt && (
                        <span className="text-green-500">
                          Resolved by {alert.resolvedBy} {formatRelativeTime(alert.resolvedAt)}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {alert.status === 'active' && (
                        <Badge variant="outline" className="bg-red-500/10 border-red-500/20">
                          <span className="text-red-500">● Active</span>
                        </Badge>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/20">
                          <span className="text-yellow-500">● Acknowledged</span>
                        </Badge>
                      )}
                      {alert.status === 'resolved' && (
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/20">
                          <span className="text-green-500">✓ Resolved</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {alert.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert.id && handleAcknowledge(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => alert.id && handleResolve(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              {selectedTab === 'active' ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold">No Active Alerts</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All systems are operating normally
                  </p>
                </>
              ) : (
                <>
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold">No Alerts Found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No alerts match the selected filter
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
