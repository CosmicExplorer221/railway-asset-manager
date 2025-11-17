import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { db } from '../../db/database'
import { Asset, AssetType, AssetStatus } from '../../types'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import {
  getAssetTypeLabel,
  getAssetStatusLabel,
  getAssetMarkerColor,
  formatDate,
} from '../../utils/formatters'
import { Filter, X } from 'lucide-react'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapViewProps {
  onAssetSelect: (id: number) => void
}

function createCustomIcon(status: AssetStatus): L.DivIcon {
  const color = getAssetMarkerColor(status)

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

function MapController({ assets }: { assets: Asset[] }) {
  const map = useMap()

  useEffect(() => {
    if (assets && assets.length > 0) {
      const bounds = L.latLngBounds(
        assets.map((asset) => [asset.latitude, asset.longitude] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [assets, map])

  return null
}

export default function MapView({ onAssetSelect }: MapViewProps) {
  const assets = useLiveQuery(() => db.assets.toArray())
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<AssetStatus[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const assetTypes: AssetType[] = [
    'signal-main',
    'signal-distant',
    'signal-shunting',
    'balise-fixed',
    'balise-switchable',
    'balise-infill',
    'axle-counter-head',
    'axle-counter-evaluator',
    'switch',
    'level-crossing',
    'radio-block-center',
  ]

  const assetStatuses: AssetStatus[] = ['operational', 'maintenance', 'fault', 'offline']

  useEffect(() => {
    if (!assets) {
      setFilteredAssets([])
      return
    }

    let filtered = assets

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.serialNumber.toLowerCase().includes(query)
      )
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((asset) => selectedTypes.includes(asset.type))
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((asset) => selectedStatuses.includes(asset.status))
    }

    setFilteredAssets(filtered)
  }, [assets, searchQuery, selectedTypes, selectedStatuses])

  const toggleType = (type: AssetType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleStatus = (status: AssetStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTypes([])
    setSelectedStatuses([])
  }

  if (!assets) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const center: [number, number] = [51.1479, 20.4807] // Center of Warsaw-Krakow line

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Asset Map</h1>
            <p className="text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {assets.length} assets
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

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search assets by name, description, or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
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

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Asset Type</h3>
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTypes([])}>
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {assetTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    {getAssetTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Status</h3>
                {selectedStatuses.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStatuses([])}>
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {assetStatuses.map((status) => (
                  <Badge
                    key={status}
                    variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(status)}
                  >
                    {getAssetStatusLabel(status)}
                  </Badge>
                ))}
              </div>
            </div>

            {(selectedTypes.length > 0 || selectedStatuses.length > 0 || searchQuery) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController assets={filteredAssets} />

          <MarkerClusterGroup chunkedLoading>
            {filteredAssets.map((asset) => (
              <Marker
                key={asset.id}
                position={[asset.latitude, asset.longitude]}
                icon={createCustomIcon(asset.status)}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline">{getAssetTypeLabel(asset.type)}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline">{getAssetStatusLabel(asset.status)}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-mono">km {asset.kilometer.toFixed(1)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Manufacturer:</span>
                        <span>{asset.manufacturer}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span>{asset.model}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Installed:</span>
                        <span>{formatDate(asset.installationDate, 'PP')}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => asset.id && onAssetSelect(asset.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}
