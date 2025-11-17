import { Asset, Event, Alert, AssetType, AssetStatus, EventType, EventSeverity } from '../types'
import { subMonths, subYears, addDays, addMonths } from 'date-fns'

// Railway line: Warsaw (52.2297, 21.0122) to Krakow (50.0647, 19.9450)
// Total distance: ~290 km

const MANUFACTURERS = {
  'signal-main': ['Siemens', 'Alstom', 'Bombardier', 'Thales'],
  'signal-distant': ['Siemens', 'Alstom', 'Bombardier'],
  'signal-shunting': ['Siemens', 'Bombardier', 'CAF'],
  'balise-fixed': ['Alstom', 'Thales', 'Bombardier'],
  'balise-switchable': ['Alstom', 'Thales'],
  'balise-infill': ['Alstom', 'Thales'],
  'axle-counter-head': ['Frauscher', 'Siemens', 'Thales'],
  'axle-counter-evaluator': ['Frauscher', 'Siemens'],
  'switch': ['Vossloh', 'Voestalpine', 'Siemens'],
  'level-crossing': ['Siemens', 'Scheidt & Bachmann', 'Bombardier'],
  'radio-block-center': ['Siemens', 'Alstom', 'Thales'],
}

const MODELS = {
  'signal-main': ['SM-400', 'SM-500', 'MS-100', 'SignalPro 3000'],
  'signal-distant': ['SD-300', 'SD-400', 'DistantPro 200'],
  'signal-shunting': ['SH-100', 'SH-200', 'ShuntMaster'],
  'balise-fixed': ['BTM-F100', 'BTM-F200', 'BalisePro-F'],
  'balise-switchable': ['BTM-S100', 'BTM-S200', 'BalisePro-S'],
  'balise-infill': ['BTM-I100', 'BalisePro-I'],
  'axle-counter-head': ['RSR123', 'RSR180', 'FAdC-H'],
  'axle-counter-evaluator': ['FAdCi', 'DigiCount', 'ACE-2000'],
  'switch': ['EW-60', 'EW-90', 'SmartSwitch Pro'],
  'level-crossing': ['LC-Safe 2000', 'LC-Pro', 'CrossGuard'],
  'radio-block-center': ['RBC-3000', 'RBC-Pro', 'ETCS-RBC'],
}

// Stations along Warsaw-Krakow line with approximate coordinates
// const STATIONS = [
//   { name: 'Warszawa Centralna', lat: 52.2297, lon: 21.0122, km: 0 },
//   { name: 'Warszawa Zachodnia', lat: 52.2227, lon: 20.9708, km: 4 },
//   { name: 'Grodzisk Mazowiecki', lat: 52.1085, lon: 20.6355, km: 30 },
//   { name: 'Żyrardów', lat: 52.0495, lon: 20.4461, km: 50 },
//   { name: 'Skierniewice', lat: 51.9553, lon: 20.1441, km: 80 },
//   { name: 'Koluszki', lat: 51.7542, lon: 19.8067, km: 130 },
//   { name: 'Piotrków Trybunalski', lat: 51.4045, lon: 19.7033, km: 165 },
//   { name: 'Włoszczowa Północ', lat: 50.8632, lon: 19.9658, km: 210 },
//   { name: 'Zawiercie', lat: 50.4897, lon: 19.4195, km: 250 },
//   { name: 'Kraków Główny', lat: 50.0647, lon: 19.9450, km: 293 },
// ]

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateSerialNumber(): string {
  const prefix = randomFromArray(['SN', 'PN', 'ID', 'RW'])
  const year = randomInt(2015, 2024)
  const number = randomInt(1000, 9999)
  return `${prefix}-${year}-${number}`
}

// Generate coordinates along the railway line
function generateCoordinates(km: number): { lat: number; lon: number } {
  // Interpolate between Warsaw and Krakow
  const startLat = 52.2297
  const startLon = 21.0122
  const endLat = 50.0647
  const endLon = 19.9450
  const totalKm = 293

  const ratio = km / totalKm
  const lat = startLat + (endLat - startLat) * ratio
  const lon = startLon + (endLon - startLon) * ratio

  // Add some randomness for variation
  const latOffset = (Math.random() - 0.5) * 0.01
  const lonOffset = (Math.random() - 0.5) * 0.01

  return {
    lat: lat + latOffset,
    lon: lon + lonOffset,
  }
}

function generateAsset(
  type: AssetType,
  index: number,
  baseKm: number
): Omit<Asset, 'id'> {
  const manufacturer = randomFromArray(MANUFACTURERS[type])
  const model = randomFromArray(MODELS[type])
  const serialNumber = generateSerialNumber()
  const installationDate = randomDate(subYears(new Date(), 2), subMonths(new Date(), 1))
  const lastMaintenanceDate = randomDate(installationDate, new Date())
  const nextMaintenanceDue = addMonths(lastMaintenanceDate, randomInt(3, 12))

  const coords = generateCoordinates(baseKm)
  const status: AssetStatus = randomFromArray([
    'operational',
    'operational',
    'operational',
    'operational',
    'operational',
    'operational',
    'operational',
    'maintenance',
    'fault',
  ] as AssetStatus[])

  const technicalSpecs: Record<string, string | number> = {}

  if (type.startsWith('signal')) {
    technicalSpecs.voltage = '24V DC'
    technicalSpecs.lampType = 'LED'
    technicalSpecs.visibility = randomInt(800, 1500) + 'm'
  } else if (type.startsWith('balise')) {
    technicalSpecs.frequency = '27MHz'
    technicalSpecs.telegramLength = randomInt(210, 1023) + ' bits'
    technicalSpecs.powerSupply = 'Inductive'
  } else if (type.startsWith('axle-counter')) {
    technicalSpecs.detectionRange = randomInt(100, 150) + 'mm'
    technicalSpecs.operatingTemp = '-40°C to +70°C'
    technicalSpecs.sensitivity = 'High'
  } else if (type === 'switch') {
    technicalSpecs.switchType = randomFromArray(['EW60-500-1:9', 'EW60-1200-1:18.5'])
    technicalSpecs.heatingPower = randomInt(3, 8) + 'kW'
    technicalSpecs.operatingTime = randomInt(4, 8) + 's'
  } else if (type === 'level-crossing') {
    technicalSpecs.barrierType = 'Automatic half-barrier'
    technicalSpecs.warningTime = randomInt(20, 40) + 's'
    technicalSpecs.roadWidth = randomInt(6, 12) + 'm'
  } else if (type === 'radio-block-center') {
    technicalSpecs.etcsLevel = 'Level 2'
    technicalSpecs.coverage = randomInt(50, 100) + 'km'
    technicalSpecs.capacity = randomInt(100, 500) + ' trains'
  }

  return {
    type,
    name: `${type.toUpperCase().replace(/-/g, ' ')} ${index.toString().padStart(3, '0')}`,
    description: `${manufacturer} ${model} ${type} located at km ${baseKm.toFixed(1)}`,
    latitude: coords.lat,
    longitude: coords.lon,
    status,
    manufacturer,
    model,
    serialNumber,
    installationDate,
    lastMaintenanceDate,
    nextMaintenanceDue,
    lineNumber: 'L001-Warsaw-Krakow',
    kilometer: baseKm,
    technicalSpecs,
    relatedAssets: [],
    createdAt: installationDate,
    updatedAt: new Date(),
  }
}

export function generateMockAssets(): Omit<Asset, 'id'>[] {
  const assets: Omit<Asset, 'id'>[] = []
  let assetIndex = 1

  // Generate signals (150 total)
  for (let i = 0; i < 50; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('signal-main', assetIndex++, km))
  }
  for (let i = 0; i < 50; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('signal-distant', assetIndex++, km))
  }
  for (let i = 0; i < 50; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('signal-shunting', assetIndex++, km))
  }

  // Generate balises (200 total)
  for (let i = 0; i < 100; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('balise-fixed', assetIndex++, km))
  }
  for (let i = 0; i < 60; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('balise-switchable', assetIndex++, km))
  }
  for (let i = 0; i < 40; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('balise-infill', assetIndex++, km))
  }

  // Generate axle counters (100 total)
  for (let i = 0; i < 60; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('axle-counter-head', assetIndex++, km))
  }
  for (let i = 0; i < 40; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('axle-counter-evaluator', assetIndex++, km))
  }

  // Generate switches (30 total)
  for (let i = 0; i < 30; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('switch', assetIndex++, km))
  }

  // Generate level crossings (15 total)
  for (let i = 0; i < 15; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('level-crossing', assetIndex++, km))
  }

  // Generate radio block centers (5 total)
  for (let i = 0; i < 5; i++) {
    const km = randomInt(0, 293)
    assets.push(generateAsset('radio-block-center', assetIndex++, km))
  }

  return assets
}

function generateEvent(
  assetId: number,
  type: EventType,
  severity: EventSeverity,
  timestamp: Date,
  resolved: boolean = false
): Omit<Event, 'id'> {
  const eventTitles: Record<EventType, string[]> = {
    installation: ['Asset installed', 'Initial deployment', 'System commissioned'],
    maintenance: [
      'Routine maintenance performed',
      'Scheduled inspection completed',
      'Preventive maintenance',
      'Component replacement',
    ],
    fault: [
      'System malfunction detected',
      'Component failure',
      'Operational error',
      'Critical fault detected',
    ],
    repair: [
      'Repair completed',
      'Component replaced',
      'System restored',
      'Fault resolved',
    ],
    inspection: [
      'Regular inspection',
      'Safety inspection completed',
      'Visual inspection',
      'Technical assessment',
    ],
    'status-change': ['Status updated', 'Operational status changed', 'Mode changed'],
    'software-update': [
      'Firmware updated',
      'Software patch applied',
      'System upgrade',
      'Configuration update',
    ],
    'communication-failure': [
      'Communication timeout',
      'Network connectivity lost',
      'Data transmission error',
      'Link failure',
    ],
    'hardware-fault': [
      'Hardware component failed',
      'Physical damage detected',
      'Equipment malfunction',
      'Sensor failure',
    ],
    environmental: [
      'Weather impact detected',
      'Temperature anomaly',
      'Environmental stress',
      'Extreme conditions',
    ],
    'power-issue': [
      'Power supply disruption',
      'Voltage fluctuation',
      'Battery low',
      'Power failure',
    ],
  }

  const eventDescriptions: Record<EventType, string[]> = {
    installation: [
      'Asset successfully installed and commissioned',
      'Initial configuration and testing completed',
      'System integrated into network',
    ],
    maintenance: [
      'Regular maintenance procedures executed according to schedule',
      'Components cleaned and calibrated',
      'System performance verified',
      'Worn parts replaced as per maintenance plan',
    ],
    fault: [
      'Unexpected system behavior detected, investigation initiated',
      'Component failure causing service degradation',
      'Critical system fault requiring immediate attention',
      'Malfunction detected during automated health check',
    ],
    repair: [
      'Faulty component successfully replaced',
      'System repaired and tested, normal operation restored',
      'Emergency repair completed, asset returned to service',
      'Corrective maintenance performed',
    ],
    inspection: [
      'Comprehensive inspection completed, no issues found',
      'Visual and functional checks performed',
      'Safety systems verified',
      'Technical parameters within acceptable range',
    ],
    'status-change': [
      'Asset status changed due to operational requirements',
      'System mode updated',
      'Configuration modified',
    ],
    'software-update': [
      'Latest firmware version installed successfully',
      'Security patches applied',
      'Software update completed, system rebooted',
      'Configuration parameters updated',
    ],
    'communication-failure': [
      'Lost connection to central system, attempting reconnection',
      'Data packet loss detected',
      'Communication link degraded',
      'Network timeout occurred',
    ],
    'hardware-fault': [
      'Physical component failure detected',
      'Sensor reading out of range',
      'Mechanical component malfunction',
      'Electronic circuit failure',
    ],
    environmental: [
      'Extreme temperature affecting system performance',
      'Weather conditions impacting operation',
      'Environmental stress detected',
      'Climate-related operational impact',
    ],
    'power-issue': [
      'Main power supply interrupted, running on backup',
      'Voltage level outside normal range',
      'Battery charge below threshold',
      'Power distribution fault',
    ],
  }

  const title = randomFromArray(eventTitles[type])
  const description = randomFromArray(eventDescriptions[type])

  const metadata: Record<string, any> = {
    autoDetected: Math.random() > 0.3,
    impactLevel: severity === 'critical' || severity === 'high' ? 'high' : 'low',
  }

  if (type === 'fault' || type === 'repair') {
    metadata.downtime = randomInt(5, 240) // minutes
  }

  if (type === 'communication-failure') {
    metadata.packetLoss = randomInt(1, 50) + '%'
    metadata.latency = randomInt(100, 5000) + 'ms'
  }

  if (type === 'environmental') {
    metadata.temperature = randomInt(-20, 45) + '°C'
    metadata.humidity = randomInt(30, 95) + '%'
  }

  const event: Omit<Event, 'id'> = {
    assetId,
    type,
    severity,
    title,
    description,
    timestamp,
    triggeredBy: type === 'maintenance' || type === 'inspection' ? 'user' : 'system',
    metadata,
    relatedEvents: [],
  }

  if (resolved && (type === 'fault' || type === 'communication-failure' || type === 'hardware-fault')) {
    event.resolvedAt = addDays(timestamp, randomInt(1, 7))
  }

  return event
}

export function generateMockEvents(assets: Asset[]): Omit<Event, 'id'>[] {
  const events: Omit<Event, 'id'>[] = []
  const now = new Date()
  const twoYearsAgo = subYears(now, 2)

  // Generate installation events for all assets
  assets.forEach((asset) => {
    if (asset.id) {
      events.push(
        generateEvent(
          asset.id,
          'installation',
          'info',
          asset.installationDate,
          true
        )
      )
    }
  })

  // Generate maintenance events (quarterly for each asset)
  assets.forEach((asset) => {
    if (asset.id) {
      const installDate = new Date(asset.installationDate)
      let maintenanceDate = addMonths(installDate, 3)

      while (maintenanceDate < now) {
        events.push(
          generateEvent(asset.id, 'maintenance', 'low', maintenanceDate, true)
        )
        maintenanceDate = addMonths(maintenanceDate, 3)
      }
    }
  })

  // Generate inspection events (semi-annually)
  assets.forEach((asset) => {
    if (asset.id) {
      const installDate = new Date(asset.installationDate)
      let inspectionDate = addMonths(installDate, 6)

      while (inspectionDate < now) {
        events.push(
          generateEvent(asset.id, 'inspection', 'info', inspectionDate, true)
        )
        inspectionDate = addMonths(inspectionDate, 6)
      }
    }
  })

  // Generate fault events with seasonal patterns (more in winter)
  const faultProneAssetCount = Math.floor(assets.length * 0.3) // 30% of assets have faults
  const faultProneAssets = assets.slice(0, faultProneAssetCount)

  faultProneAssets.forEach((asset) => {
    if (asset.id) {
      const faultCount = randomInt(2, 8)

      for (let i = 0; i < faultCount; i++) {
        let faultDate = randomDate(twoYearsAgo, now)

        // Increase probability of winter faults
        const month = faultDate.getMonth()
        if (month >= 3 && month <= 8 && Math.random() > 0.3) {
          // Not winter, 70% chance to re-roll
          faultDate = randomDate(twoYearsAgo, now)
        }

        const faultTypes: EventType[] = [
          'fault',
          'communication-failure',
          'hardware-fault',
          'environmental',
          'power-issue',
        ]
        const faultType = randomFromArray(faultTypes)
        const severity = randomFromArray([
          'critical',
          'high',
          'medium',
          'low',
        ] as EventSeverity[])

        const isResolved = Math.random() > 0.2 // 80% resolved

        events.push(generateEvent(asset.id, faultType, severity, faultDate, isResolved))

        if (isResolved) {
          const repairDate = addDays(faultDate, randomInt(1, 5))
          events.push(generateEvent(asset.id, 'repair', 'medium', repairDate, true))
        }
      }
    }
  })

  // Generate software update events
  assets.forEach((asset) => {
    if (asset.id && Math.random() > 0.5) {
      // 50% of assets get software updates
      const updateCount = randomInt(1, 3)

      for (let i = 0; i < updateCount; i++) {
        const updateDate = randomDate(twoYearsAgo, now)
        events.push(
          generateEvent(asset.id, 'software-update', 'low', updateDate, true)
        )
      }
    }
  })

  // Sort events by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

export function generateMockAlerts(events: Event[]): Omit<Alert, 'id'>[] {
  const alerts: Omit<Alert, 'id'>[] = []

  // Create alerts for critical and high severity events that are faults
  const criticalEvents = events.filter(
    (e) =>
      (e.severity === 'critical' || e.severity === 'high') &&
      (e.type === 'fault' ||
        e.type === 'communication-failure' ||
        e.type === 'hardware-fault' ||
        e.type === 'power-issue')
  )

  criticalEvents.forEach((event) => {
    if (event.id) {
      const isResolved = event.resolvedAt !== undefined
      const isAcknowledged = isResolved || Math.random() > 0.3

      const alert: Omit<Alert, 'id'> = {
        assetId: event.assetId,
        eventId: event.id,
        severity: event.severity,
        title: event.title,
        description: event.description,
        status: isResolved ? 'resolved' : isAcknowledged ? 'acknowledged' : 'active',
        createdAt: event.timestamp,
      }

      if (isAcknowledged) {
        alert.acknowledgedAt = addDays(event.timestamp, randomInt(0, 1))
        alert.acknowledgedBy = randomFromArray([
          'operator.smith',
          'tech.johnson',
          'admin.williams',
        ])
      }

      if (isResolved && event.resolvedAt) {
        alert.resolvedAt = event.resolvedAt
        alert.resolvedBy = randomFromArray([
          'tech.johnson',
          'maintenance.brown',
          'engineer.davis',
        ])
      }

      alerts.push(alert)
    }
  })

  return alerts
}

export async function initializeMockData(db: any): Promise<void> {
  // Check if data already exists
  const existingAssets = await db.assets.count()

  if (existingAssets > 0) {
    console.log('Database already contains data. Skipping initialization.')
    return
  }

  console.log('Generating mock data...')

  // Generate assets
  const mockAssets = generateMockAssets()
  console.log(`Generated ${mockAssets.length} assets`)

  // Add assets to database
  await db.assets.bulkAdd(mockAssets)

  // Fetch assets with IDs
  const assetsWithIds = await db.assets.toArray()

  // Generate events
  const mockEvents = generateMockEvents(assetsWithIds)
  console.log(`Generated ${mockEvents.length} events`)

  // Add events to database
  await db.events.bulkAdd(mockEvents)

  // Fetch events with IDs
  const eventsWithIds = await db.events.toArray()

  // Generate alerts
  const mockAlerts = generateMockAlerts(eventsWithIds)
  console.log(`Generated ${mockAlerts.length} alerts`)

  // Add alerts to database
  await db.alerts.bulkAdd(mockAlerts)

  console.log('Mock data initialization complete!')
  console.log(`Total: ${assetsWithIds.length} assets, ${mockEvents.length} events, ${mockAlerts.length} alerts`)
}
