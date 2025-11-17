import { useState } from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import MapView from './components/Map/MapView'
import AssetList from './components/AssetList/AssetList'
import AssetDetail from './components/AssetDetail/AssetDetail'
import Timeline from './components/Timeline/Timeline'
import Alerts from './components/Alerts/Alerts'
import Reports from './components/Reports/Reports'
import { Menu, Map, List, Activity, Bell, FileText, LayoutDashboard } from 'lucide-react'

type View = 'dashboard' | 'map' | 'assets' | 'timeline' | 'alerts' | 'reports'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', name: 'Map View', icon: Map },
    { id: 'assets', name: 'Assets', icon: List },
    { id: 'timeline', name: 'Timeline', icon: Activity },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'reports', name: 'Reports', icon: FileText },
  ]

  const handleNavigate = (view: string) => {
    setCurrentView(view as View)
  }

  const renderView = () => {
    if (selectedAssetId && currentView === 'assets') {
      return <AssetDetail assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'map':
        return <MapView onAssetSelect={setSelectedAssetId} />
      case 'assets':
        return <AssetList onAssetSelect={setSelectedAssetId} />
      case 'timeline':
        return <Timeline />
      case 'alerts':
        return <Alerts />
      case 'reports':
        return <Reports />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary">Railway Assets</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View)
                  setSelectedAssetId(null)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  currentView === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            )
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-border text-xs text-muted-foreground">
            <p>Railway Asset Manager v1.0</p>
            <p className="mt-1">© 2025 - All rights reserved</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  )
}

export default App
