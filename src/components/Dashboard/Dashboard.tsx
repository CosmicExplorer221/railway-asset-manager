import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { assetOperations, eventOperations } from '../../db/operations'
import { initializeMockData } from '../../db/mockData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Wrench,
  XCircle,
  Map as MapIcon,
  List,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatRelativeTime, getAssetTypeLabel, getSeverityColor } from '../../utils/formatters'

interface DashboardProps {
  onNavigate: (view: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const assets = useLiveQuery(() => db.assets.toArray())
  const events = useLiveQuery(() => db.events.orderBy('timestamp').reverse().limit(10).toArray())
  const alerts = useLiveQuery(() => db.alerts.where('status').equals('active').toArray())

  useEffect(() => {
    async function checkAndInitialize() {
      const count = await db.assets.count()
      if (count === 0) {
        setIsInitializing(true)
        await initializeMockData(db)
        setIsInitializing(false)
      }
    }
    checkAndInitialize()
  }, [])

  useEffect(() => {
    async function loadStats() {
      const assetStats = await assetOperations.getStatistics()
      const eventStats = await eventOperations.getStatistics()
      setStats({ assetStats, eventStats })
    }
    if (assets && assets.length > 0) {
      loadStats()
    }
  }, [assets])

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing database with mock data...</p>
          <p className="text-sm text-muted-foreground mt-2">Generating 500+ assets and 2000+ events</p>
        </div>
      </div>
    )
  }

  if (!assets || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { assetStats } = stats

  // Prepare data for charts
  const assetTypeData = Object.entries(assetStats.byType || {}).map(([type, count]) => ({
    name: getAssetTypeLabel(type as any),
    value: count as number,
  }))

  const assetStatusData = Object.entries(assetStats.byStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
  }))

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4']

  const STATUS_COLORS: Record<string, string> = {
    Operational: '#22c55e',
    Maintenance: '#eab308',
    Fault: '#ef4444',
    Offline: '#6b7280',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Railway Asset Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of railway infrastructure assets and system health
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-4xl">{assetStats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="mr-2 h-4 w-4" />
              All infrastructure assets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Operational</CardDescription>
            <CardTitle className="text-4xl text-green-500">
              {assetStats.operationalPercentage.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              {assetStats.byStatus?.operational || 0} assets operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Faults</CardDescription>
            <CardTitle className="text-4xl text-red-500">{assetStats.faultCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Requiring attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Maintenance Due</CardDescription>
            <CardTitle className="text-4xl text-yellow-500">
              {assetStats.maintenanceDue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Wrench className="mr-2 h-4 w-4 text-yellow-500" />
              Scheduled maintenance overdue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Status Distribution</CardTitle>
            <CardDescription>Current operational status of all assets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Assets by Type</CardTitle>
            <CardDescription>Distribution of different asset categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetTypeData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f9fafb' }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest system activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('timeline')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events && events.length > 0 ? (
                events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 pb-3 border-b border-border last:border-0">
                    <div className={`mt-0.5 ${getSeverityColor(event.severity)}`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(event.timestamp)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Alerts requiring attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('alerts')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 pb-3 border-b border-border last:border-0">
                    <div className={`mt-0.5 ${getSeverityColor(alert.severity)}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(alert.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate('map')}>
              <MapIcon className="h-6 w-6 mb-2" />
              View Map
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate('assets')}>
              <List className="h-6 w-6 mb-2" />
              Asset List
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate('alerts')}>
              <AlertTriangle className="h-6 w-6 mb-2" />
              View Alerts
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate('reports')}>
              <TrendingUp className="h-6 w-6 mb-2" />
              Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
