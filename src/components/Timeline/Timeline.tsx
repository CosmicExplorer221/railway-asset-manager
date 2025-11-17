import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { Event, EventType, EventSeverity } from '../../types'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import {
  getEventTypeLabel,
  getSeverityLabel,
  getSeverityColor,
  getSeverityBgColor,
  
  formatDate,
} from '../../utils/formatters'
import { Calendar, Filter, Search, X, Activity } from 'lucide-react'
import { format, subDays } from 'date-fns'

export default function Timeline() {
  const events = useLiveQuery(() => db.events.orderBy('timestamp').reverse().toArray())
  const assets = useLiveQuery(() => db.assets.toArray())

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<EventSeverity[]>([])
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const eventTypes: EventType[] = [
    'installation',
    'maintenance',
    'fault',
    'repair',
    'inspection',
    'status-change',
    'software-update',
    'communication-failure',
    'hardware-fault',
    'environmental',
    'power-issue',
  ]

  const severities: EventSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

  useEffect(() => {
    if (!events) {
      setFilteredEvents([])
      return
    }

    let filtered = [...events]

    // Apply search filter
    if (searchQuery && assets) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((event) => {
        const asset = assets.find((a) => a.id === event.assetId)
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          asset?.name.toLowerCase().includes(query) ||
          asset?.serialNumber.toLowerCase().includes(query)
        )
      })
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((event) => selectedTypes.includes(event.type))
    }

    // Apply severity filter
    if (selectedSeverities.length > 0) {
      filtered = filtered.filter((event) => selectedSeverities.includes(event.severity))
    }

    // Apply date range filter
    const now = new Date()
    if (dateRange === '24h') {
      const yesterday = subDays(now, 1)
      filtered = filtered.filter((event) => new Date(event.timestamp) >= yesterday)
    } else if (dateRange === '7d') {
      const weekAgo = subDays(now, 7)
      filtered = filtered.filter((event) => new Date(event.timestamp) >= weekAgo)
    } else if (dateRange === '30d') {
      const monthAgo = subDays(now, 30)
      filtered = filtered.filter((event) => new Date(event.timestamp) >= monthAgo)
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, selectedTypes, selectedSeverities, dateRange, assets])

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleSeverity = (severity: EventSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTypes([])
    setSelectedSeverities([])
    setDateRange('all')
  }

  const getAssetName = (assetId: number): string => {
    const asset = assets?.find((a) => a.id === assetId)
    return asset?.name || `Asset #${assetId}`
  }

  if (!events || !assets) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Group events by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = formatDate(event.timestamp, 'PP')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by title, description, or asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium mb-2">Time Range</h3>
              <div className="flex flex-wrap gap-2">
                {(['all', '24h', '7d', '30d'] as const).map((range) => (
                  <Badge
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setDateRange(range)}
                  >
                    {range === 'all' ? 'All Time' : range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </Badge>
                ))}
              </div>
            </div>

            {showFilters && (
              <>
                {/* Event Types */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Event Type</h3>
                    {selectedTypes.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTypes([])}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleType(type)}
                      >
                        {getEventTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Severity</h3>
                    {selectedSeverities.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSeverities([])}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {severities.map((severity) => (
                      <Badge
                        key={severity}
                        variant={selectedSeverities.includes(severity) ? 'default' : 'outline'}
                        className={`cursor-pointer ${selectedSeverities.includes(severity) ? '' : getSeverityColor(severity)}`}
                        onClick={() => toggleSeverity(severity)}
                      >
                        {getSeverityLabel(severity)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(selectedTypes.length > 0 || selectedSeverities.length > 0 || searchQuery || dateRange !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{date}</h2>
                <Badge variant="outline">{dayEvents.length} events</Badge>
              </div>

              <div className="space-y-3 ml-8 border-l-2 border-border pl-6">
                {dayEvents.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[29px] top-2 w-3 h-3 rounded-full border-2 border-background ${getSeverityBgColor(event.severity)}`}
                    ></div>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${getSeverityColor(event.severity)}`}>
                                <Activity className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {event.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                  <Badge variant="outline">{getEventTypeLabel(event.type)}</Badge>
                                  <Badge
                                    variant="outline"
                                    className={getSeverityBgColor(event.severity)}
                                  >
                                    <span className={getSeverityColor(event.severity)}>
                                      {getSeverityLabel(event.severity)}
                                    </span>
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {getAssetName(event.assetId)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {format(new Date(event.timestamp), 'p')}
                                  </span>
                                  {event.resolvedAt && (
                                    <Badge variant="outline" className="bg-green-500/10 border-green-500/20">
                                      <span className="text-green-500">✓ Resolved</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters to see more results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
