import Dexie, { Table } from 'dexie'
import { Asset, Event, Alert } from '../types'

export class RailwayAssetDatabase extends Dexie {
  assets!: Table<Asset, number>
  events!: Table<Event, number>
  alerts!: Table<Alert, number>

  constructor() {
    super('RailwayAssetDB')

    this.version(1).stores({
      assets: '++id, type, status, lineNumber, installationDate, name',
      events: '++id, assetId, type, severity, timestamp, resolvedAt',
      alerts: '++id, assetId, eventId, severity, status, createdAt',
    })

    this.assets = this.table('assets')
    this.events = this.table('events')
    this.alerts = this.table('alerts')
  }
}

export const db = new RailwayAssetDatabase()
