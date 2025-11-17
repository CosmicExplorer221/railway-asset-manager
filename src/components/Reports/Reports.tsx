import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { assetOperations } from '../../db/operations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import {
  getAssetTypeLabel,
  getAssetStatusLabel,
  getEventTypeLabel,
  formatDate,
  formatDuration,
} from '../../utils/formatters'
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { subDays, subMonths, eachDayOfInterval, format } from 'date-fns'

type ReportType = 'asset-inventory' | 'fault-analysis' | 'maintenance-schedule' | 'uptime-availability' | 'event-summary'

export default function Reports() {
  const assets = useLiveQuery(() => db.assets.toArray())
  const events = useLiveQuery(() => db.events.toArray())
  // const alerts = useLiveQuery(() => db.alerts.toArray())

  const [selectedReport, setSelectedReport] = useState<ReportType>('asset-inventory')
  const [dateRange] = useState({ from: subMonths(new Date(), 1), to: new Date() })
  const [reportData, setReportData] = useState<any>(null)

  const reports = [
    {
      id: 'asset-inventory' as ReportType,
      name: 'Asset Inventory Report',
      description: 'Complete inventory of all assets with status breakdown',
      icon: FileText,
    },
    {
      id: 'fault-analysis' as ReportType,
      name: 'Fault Analysis Report',
      description: 'Analysis of faults, failures, and system issues',
      icon: TrendingUp,
    },
    {
      id: 'maintenance-schedule' as ReportType,
      name: 'Maintenance Schedule',
      description: 'Upcoming and overdue maintenance activities',
      icon: Calendar,
    },
    {
      id: 'uptime-availability' as ReportType,
      name: 'Uptime & Availability',
      description: 'System uptime and availability metrics',
      icon: BarChart3,
    },
    {
      id: 'event-summary' as ReportType,
      name: 'Event Summary Report',
      description: 'Summary of all events in selected time period',
      icon: PieChartIcon,
    },
  ]

  useEffect(() => {
    generateReportData()
  }, [selectedReport, dateRange, assets, events])

  const generateReportData = async () => {
    if (!assets || !events) return

    let data: any = {}

    switch (selectedReport) {
      case 'asset-inventory':
        const assetStats = await assetOperations.getStatistics()
        data = {
          stats: assetStats,
          assetsByType: Object.entries(assetStats.byType).map(([type, count]) => ({
            name: getAssetTypeLabel(type as any),
            value: count,
          })),
          assetsByStatus: Object.entries(assetStats.byStatus).map(([status, count]) => ({
            name: getAssetStatusLabel(status as any),
            value: count,
          })),
        }
        break

      case 'fault-analysis':
        const faultEvents = events.filter(
          (e) =>
            (e.type === 'fault' ||
              e.type === 'hardware-fault' ||
              e.type === 'communication-failure' ||
              e.type === 'power-issue') &&
            new Date(e.timestamp) >= dateRange.from &&
            new Date(e.timestamp) <= dateRange.to
        )

        const faultsByType = faultEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const faultsByAsset = faultEvents.reduce((acc, event) => {
          const asset = assets.find((a) => a.id === event.assetId)
          if (asset) {
            const key = asset.name
            acc[key] = (acc[key] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)

        // Get top 10 assets with most faults
        const topFaultyAssets = Object.entries(faultsByAsset)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }))

        data = {
          totalFaults: faultEvents.length,
          resolvedFaults: faultEvents.filter((e) => e.resolvedAt).length,
          faultsByType: Object.entries(faultsByType).map(([type, count]) => ({
            name: getEventTypeLabel(type as any),
            value: count,
          })),
          topFaultyAssets,
        }
        break

      case 'maintenance-schedule':
        const now = new Date()
        const overdue = assets.filter((a) => new Date(a.nextMaintenanceDue) < now)
        const upcoming = assets.filter((a) => {
          const dueDate = new Date(a.nextMaintenanceDue)
          return dueDate >= now && dueDate <= subDays(now, -30)
        })

        const maintenanceEvents = events.filter(
          (e) =>
            e.type === 'maintenance' &&
            new Date(e.timestamp) >= dateRange.from &&
            new Date(e.timestamp) <= dateRange.to
        )

        data = {
          overdue,
          upcoming,
          completed: maintenanceEvents.length,
          overdueCount: overdue.length,
          upcomingCount: upcoming.length,
        }
        break

      case 'uptime-availability':
        const totalAssets = assets.length
        const operational = assets.filter((a) => a.status === 'operational').length
        const availability = totalAssets > 0 ? (operational / totalAssets) * 100 : 0

        const faultsInPeriod = events.filter(
          (e) =>
            (e.type === 'fault' || e.type === 'hardware-fault') &&
            new Date(e.timestamp) >= dateRange.from &&
            new Date(e.timestamp) <= dateRange.to
        )

        const avgResolutionTime =
          faultsInPeriod.filter((e) => e.resolvedAt).length > 0
            ? faultsInPeriod
                .filter((e) => e.resolvedAt)
                .reduce((acc, e) => {
                  return acc + (new Date(e.resolvedAt!).getTime() - new Date(e.timestamp).getTime())
                }, 0) / faultsInPeriod.filter((e) => e.resolvedAt).length
            : 0

        data = {
          availability,
          operational,
          totalAssets,
          faultsInPeriod: faultsInPeriod.length,
          avgResolutionTime,
        }
        break

      case 'event-summary':
        const periodEvents = events.filter(
          (e) =>
            new Date(e.timestamp) >= dateRange.from && new Date(e.timestamp) <= dateRange.to
        )

        const eventsByType = periodEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const eventsBySeverity = periodEvents.reduce((acc, event) => {
          acc[event.severity] = (acc[event.severity] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Events over time (daily)
        const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
        const eventsOverTime = days.map((day) => {
          const dayEvents = periodEvents.filter(
            (e) => format(new Date(e.timestamp), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          )
          return {
            date: format(day, 'MMM dd'),
            events: dayEvents.length,
          }
        })

        data = {
          totalEvents: periodEvents.length,
          eventsByType: Object.entries(eventsByType).map(([type, count]) => ({
            name: getEventTypeLabel(type as any),
            value: count,
          })),
          eventsBySeverity: Object.entries(eventsBySeverity).map(([severity, count]) => ({
            name: severity.charAt(0).toUpperCase() + severity.slice(1),
            value: count,
          })),
          eventsOverTime,
        }
        break
    }

    setReportData(data)
  }

  const exportToCSV = () => {
    if (!reportData || !assets || !events) return

    let csvContent = ''
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss')

    switch (selectedReport) {
      case 'asset-inventory':
        csvContent = 'Asset Name,Type,Status,Serial Number,Manufacturer,Model,Location (km),Installation Date\n'
        assets.forEach((asset) => {
          csvContent += `${asset.name},${getAssetTypeLabel(asset.type)},${getAssetStatusLabel(asset.status)},${asset.serialNumber},${asset.manufacturer},${asset.model},${asset.kilometer.toFixed(1)},${formatDate(asset.installationDate, 'yyyy-MM-dd')}\n`
        })
        break

      case 'fault-analysis':
        csvContent = 'Fault Type,Count\n'
        reportData.faultsByType.forEach((item: any) => {
          csvContent += `${item.name},${item.value}\n`
        })
        break

      case 'maintenance-schedule':
        csvContent = 'Asset Name,Type,Status,Next Maintenance Due,Overdue\n'
        ;[...reportData.overdue, ...reportData.upcoming].forEach((asset) => {
          const isOverdue = new Date(asset.nextMaintenanceDue) < new Date()
          csvContent += `${asset.name},${getAssetTypeLabel(asset.type)},${getAssetStatusLabel(asset.status)},${formatDate(asset.nextMaintenanceDue, 'yyyy-MM-dd')},${isOverdue ? 'Yes' : 'No'}\n`
        })
        break

      default:
        csvContent = 'Report data not available for CSV export\n'
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedReport}-${timestamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4']

  if (!assets || !events || !reportData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const selectedReportInfo = reports.find((r) => r.id === selectedReport)!

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive reports and export data
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all ${
                selectedReport === report.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="mt-2">{report.description}</CardDescription>
                  </div>
                  <Icon className={`h-6 w-6 ${selectedReport === report.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedReportInfo.name}</CardTitle>
          <CardDescription>
            Date Range: {formatDate(dateRange.from, 'PP')} - {formatDate(dateRange.to, 'PP')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Asset Inventory Report */}
          {selectedReport === 'asset-inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-3xl font-bold mt-2">{reportData.stats.total}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Operational</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">
                    {reportData.stats.operationalPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Faults</p>
                  <p className="text-3xl font-bold mt-2 text-red-500">
                    {reportData.stats.faultCount}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Maintenance Due</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-500">
                    {reportData.stats.maintenanceDue}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Assets by Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.assetsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Assets by Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.assetsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.assetsByStatus.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Fault Analysis Report */}
          {selectedReport === 'fault-analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Faults</p>
                  <p className="text-3xl font-bold mt-2 text-red-500">{reportData.totalFaults}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">
                    {reportData.resolvedFaults}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-3xl font-bold mt-2">
                    {reportData.totalFaults > 0
                      ? ((reportData.resolvedFaults / reportData.totalFaults) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Faults by Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.faultsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.faultsByType.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Top 10 Assets with Most Faults</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.topFaultyAssets} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" tick={{ fill: '#9ca3af' }} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Schedule Report */}
          {selectedReport === 'maintenance-schedule' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold mt-2 text-red-500">
                    {reportData.overdueCount}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Upcoming (30 days)</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-500">
                    {reportData.upcomingCount}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">
                    {reportData.completed}
                  </p>
                </div>
              </div>

              {reportData.overdue.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-red-500">Overdue Maintenance ({reportData.overdue.length})</h3>
                  <div className="space-y-2">
                    {reportData.overdue.slice(0, 10).map((asset: any) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 border border-red-500/20 bg-red-500/5 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getAssetTypeLabel(asset.type)} • {asset.serialNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-500">
                            Due: {formatDate(asset.nextMaintenanceDue, 'PP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Uptime & Availability Report */}
          {selectedReport === 'uptime-availability' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">System Availability</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">
                    {reportData.availability.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Operational Assets</p>
                  <p className="text-3xl font-bold mt-2">{reportData.operational}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Faults in Period</p>
                  <p className="text-3xl font-bold mt-2 text-red-500">
                    {reportData.faultsInPeriod}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatDuration(reportData.avgResolutionTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Summary Report */}
          {selectedReport === 'event-summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold mt-2">{reportData.totalEvents}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="text-lg font-medium mt-2">
                    {formatDate(dateRange.from, 'PP')} - {formatDate(dateRange.to, 'PP')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Events by Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.eventsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.eventsByType.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Events by Severity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.eventsBySeverity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                      <YAxis tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Events Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.eventsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
