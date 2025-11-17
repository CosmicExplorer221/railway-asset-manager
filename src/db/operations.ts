import { db } from './database'
import {
  Asset,
  Event,
  Alert,
  AssetFilter,
  EventFilter,
  AssetStatistics,
  EventStatistics,
  AssetType,
  AssetStatus,
  EventType,
  EventSeverity,
} from '../types'

// Asset Operations
export const assetOperations = {
  async getAll(): Promise<Asset[]> {
    return await db.assets.toArray()
  },

  async getById(id: number): Promise<Asset | undefined> {
    return await db.assets.get(id)
  },

  async getByIds(ids: number[]): Promise<Asset[]> {
    return await db.assets.where('id').anyOf(ids).toArray()
  },

  async create(asset: Omit<Asset, 'id'>): Promise<number> {
    return await db.assets.add(asset as Asset)
  },

  async update(id: number, updates: Partial<Asset>): Promise<number> {
    return await db.assets.update(id, { ...updates, updatedAt: new Date() })
  },

  async delete(id: number): Promise<void> {
    await db.assets.delete(id)
  },

  async filter(filter: AssetFilter): Promise<Asset[]> {
    let query = db.assets.toCollection()

    if (filter.types && filter.types.length > 0) {
      query = db.assets.where('type').anyOf(filter.types)
    }

    let results = await query.toArray()

    if (filter.statuses && filter.statuses.length > 0) {
      results = results.filter((a) => filter.statuses!.includes(a.status))
    }

    if (filter.lineNumber) {
      results = results.filter((a) => a.lineNumber === filter.lineNumber)
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.serialNumber.toLowerCase().includes(query)
      )
    }

    if (filter.dateRange) {
      results = results.filter(
        (a) =>
          a.installationDate >= filter.dateRange!.from &&
          a.installationDate <= filter.dateRange!.to
      )
    }

    return results
  },

  async getStatistics(): Promise<AssetStatistics> {
    const assets = await db.assets.toArray()
    const total = assets.length

    const byType = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1
      return acc
    }, {} as Record<AssetType, number>)

    const byStatus = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1
      return acc
    }, {} as Record<AssetStatus, number>)

    const operational = byStatus.operational || 0
    const operationalPercentage = total > 0 ? (operational / total) * 100 : 0
    const faultCount = byStatus.fault || 0

    const now = new Date()
    const maintenanceDue = assets.filter((a) => a.nextMaintenanceDue <= now).length

    return {
      total,
      byType,
      byStatus,
      operationalPercentage,
      faultCount,
      maintenanceDue,
    }
  },

  async bulkImport(assets: Omit<Asset, 'id'>[]): Promise<number> {
    return await db.assets.bulkAdd(assets as Asset[])
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await db.assets.bulkDelete(ids)
  },
}

// Event Operations
export const eventOperations = {
  async getAll(): Promise<Event[]> {
    return await db.events.orderBy('timestamp').reverse().toArray()
  },

  async getById(id: number): Promise<Event | undefined> {
    return await db.events.get(id)
  },

  async getByAssetId(assetId: number): Promise<Event[]> {
    return await db.events.where('assetId').equals(assetId).reverse().sortBy('timestamp')
  },

  async getRecent(limit: number = 50): Promise<Event[]> {
    return await db.events.orderBy('timestamp').reverse().limit(limit).toArray()
  },

  async create(event: Omit<Event, 'id'>): Promise<number> {
    return await db.events.add(event as Event)
  },

  async update(id: number, updates: Partial<Event>): Promise<number> {
    return await db.events.update(id, updates)
  },

  async delete(id: number): Promise<void> {
    await db.events.delete(id)
  },

  async filter(filter: EventFilter): Promise<Event[]> {
    let query = db.events.toCollection()

    if (filter.assetIds && filter.assetIds.length > 0) {
      query = db.events.where('assetId').anyOf(filter.assetIds)
    }

    let results = await query.toArray()

    if (filter.types && filter.types.length > 0) {
      results = results.filter((e) => filter.types!.includes(e.type))
    }

    if (filter.severities && filter.severities.length > 0) {
      results = results.filter((e) => filter.severities!.includes(e.severity))
    }

    if (filter.dateRange) {
      results = results.filter(
        (e) =>
          e.timestamp >= filter.dateRange!.from && e.timestamp <= filter.dateRange!.to
      )
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  async getStatistics(): Promise<EventStatistics> {
    const events = await db.events.toArray()
    const total = events.length

    const byType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<EventType, number>)

    const bySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<EventSeverity, number>)

    const recentEvents = await eventOperations.getRecent(10)

    const resolvedEvents = events.filter((e) => e.resolvedAt)
    const totalResolutionTime = resolvedEvents.reduce((acc, e) => {
      if (e.resolvedAt) {
        return acc + (e.resolvedAt.getTime() - e.timestamp.getTime())
      }
      return acc
    }, 0)

    const averageResolutionTime =
      resolvedEvents.length > 0 ? totalResolutionTime / resolvedEvents.length : 0

    return {
      total,
      byType,
      bySeverity,
      recentEvents,
      averageResolutionTime,
    }
  },

  async bulkImport(events: Omit<Event, 'id'>[]): Promise<number> {
    return await db.events.bulkAdd(events as Event[])
  },
}

// Alert Operations
export const alertOperations = {
  async getAll(): Promise<Alert[]> {
    return await db.alerts.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: number): Promise<Alert | undefined> {
    return await db.alerts.get(id)
  },

  async getActive(): Promise<Alert[]> {
    return await db.alerts.where('status').equals('active').reverse().sortBy('createdAt')
  },

  async getByAssetId(assetId: number): Promise<Alert[]> {
    return await db.alerts.where('assetId').equals(assetId).reverse().sortBy('createdAt')
  },

  async create(alert: Omit<Alert, 'id'>): Promise<number> {
    return await db.alerts.add(alert as Alert)
  },

  async update(id: number, updates: Partial<Alert>): Promise<number> {
    return await db.alerts.update(id, updates)
  },

  async acknowledge(id: number, acknowledgedBy: string): Promise<number> {
    return await db.alerts.update(id, {
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      acknowledgedBy,
    })
  },

  async resolve(id: number, resolvedBy: string): Promise<number> {
    return await db.alerts.update(id, {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy,
    })
  },

  async delete(id: number): Promise<void> {
    await db.alerts.delete(id)
  },

  async bulkImport(alerts: Omit<Alert, 'id'>[]): Promise<number> {
    return await db.alerts.bulkAdd(alerts as Alert[])
  },
}

// Utility Operations
export const utilityOperations = {
  async clearAllData(): Promise<void> {
    await db.assets.clear()
    await db.events.clear()
    await db.alerts.clear()
  },

  async exportData() {
    const assets = await db.assets.toArray()
    const events = await db.events.toArray()
    const alerts = await db.alerts.toArray()

    return {
      assets,
      events,
      alerts,
      exportedAt: new Date(),
      version: '1.0',
    }
  },

  async importData(data: {
    assets?: Asset[]
    events?: Event[]
    alerts?: Alert[]
  }): Promise<{ assetsImported: number; eventsImported: number; alertsImported: number }> {
    let assetsImported = 0
    let eventsImported = 0
    let alertsImported = 0

    if (data.assets && data.assets.length > 0) {
      const assetsWithoutId = data.assets.map(({ id, ...rest }) => rest)
      assetsImported = await db.assets.bulkAdd(assetsWithoutId as Asset[])
    }

    if (data.events && data.events.length > 0) {
      const eventsWithoutId = data.events.map(({ id, ...rest }) => rest)
      eventsImported = await db.events.bulkAdd(eventsWithoutId as Event[])
    }

    if (data.alerts && data.alerts.length > 0) {
      const alertsWithoutId = data.alerts.map(({ id, ...rest }) => rest)
      alertsImported = await db.alerts.bulkAdd(alertsWithoutId as Alert[])
    }

    return { assetsImported, eventsImported, alertsImported }
  },
}
