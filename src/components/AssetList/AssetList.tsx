import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { Asset, AssetType, AssetStatus } from '../../types'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import {
  getAssetTypeLabel,
  getAssetStatusLabel,
  getAssetStatusColor,
  getAssetStatusBgColor,
  formatDate,
} from '../../utils/formatters'
import { Search, Filter, ArrowUpDown, Download, X } from 'lucide-react'

interface AssetListProps {
  onAssetSelect: (id: number) => void
}

type SortField = 'name' | 'type' | 'status' | 'kilometer' | 'installationDate'
type SortDirection = 'asc' | 'desc'

export default function AssetList({ onAssetSelect }: AssetListProps) {
  const assets = useLiveQuery(() => db.assets.toArray())
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<AssetStatus[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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

    let filtered = [...assets]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.serialNumber.toLowerCase().includes(query) ||
          asset.manufacturer.toLowerCase().includes(query) ||
          asset.model.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((asset) => selectedTypes.includes(asset.type))
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((asset) => selectedStatuses.includes(asset.status))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'installationDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredAssets(filtered)
  }, [assets, searchQuery, selectedTypes, selectedStatuses, sortField, sortDirection])

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    if (!filteredAssets.length) return

    const headers = ['Name', 'Type', 'Status', 'Serial Number', 'Manufacturer', 'Model', 'Location (km)', 'Installation Date']
    const rows = filteredAssets.map(asset => [
      asset.name,
      getAssetTypeLabel(asset.type),
      getAssetStatusLabel(asset.status),
      asset.serialNumber,
      asset.manufacturer,
      asset.model,
      asset.kilometer.toFixed(1),
      formatDate(asset.installationDate, 'yyyy-MM-dd'),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!assets) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, serial number, manufacturer, or model..."
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

          {showFilters && (
            <div className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-primary"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center hover:text-primary"
                    >
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-primary"
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">Serial Number</th>
                  <th className="text-left p-4 font-medium">Manufacturer</th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('kilometer')}
                      className="flex items-center hover:text-primary"
                    >
                      Location
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('installationDate')}
                      className="flex items-center hover:text-primary"
                    >
                      Installed
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => asset.id && onAssetSelect(asset.id)}
                    >
                      <td className="p-4 font-medium">{asset.name}</td>
                      <td className="p-4">
                        <Badge variant="outline">{getAssetTypeLabel(asset.type)}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={getAssetStatusBgColor(asset.status)}
                        >
                          <span className={getAssetStatusColor(asset.status)}>
                            {getAssetStatusLabel(asset.status)}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-sm">{asset.serialNumber}</td>
                      <td className="p-4">{asset.manufacturer}</td>
                      <td className="p-4 font-mono text-sm">km {asset.kilometer.toFixed(1)}</td>
                      <td className="p-4 text-sm">{formatDate(asset.installationDate, 'PP')}</td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            asset.id && onAssetSelect(asset.id)
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No assets found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
