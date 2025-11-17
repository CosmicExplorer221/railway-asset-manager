# Railway Asset Management & Visualization Platform

A comprehensive full-stack web application for managing and visualizing railway infrastructure assets on an interactive map. Built with React, TypeScript, Leaflet.js, and IndexedDB for offline-first functionality.

![Railway Asset Manager](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🗺️ Interactive Map Visualization
- **Leaflet.js Integration**: High-performance map rendering with OpenStreetMap tiles
- **Asset Markers**: Color-coded markers based on asset type and operational status
- **Marker Clustering**: Automatic grouping of assets in dense areas for better performance
- **Real-time Filtering**: Filter assets by type, status, location, and search queries
- **Layer Controls**: Toggle different asset types on/off
- **Detailed Popups**: Click any asset to view comprehensive information

### 📊 Dashboard & Analytics
- **KPI Overview**: Total assets, operational percentage, fault count, maintenance due
- **Visual Charts**: Interactive charts using Recharts (pie charts, bar charts, line charts)
- **Asset Distribution**: View assets by type and status
- **Recent Activity**: Latest events and active alerts
- **Quick Actions**: Fast navigation to key sections

### 🔧 Asset Management
- **Complete CRUD Operations**: Create, Read, Update, Delete assets
- **Detailed Asset View**:
  - Technical specifications
  - Installation date, manufacturer, model
  - Current status and location
  - Related assets and dependencies
  - Complete event history
- **Bulk Operations**: Import/export assets via CSV
- **Search & Filter**: Advanced filtering by multiple criteria
- **Sortable Lists**: Sort by name, type, status, location, installation date

### 📅 Timeline & Event Tracking
- **Chronological View**: All events displayed in timeline format
- **Event Types**: Installation, maintenance, faults, repairs, inspections, status changes
- **Severity Levels**: Critical, high, medium, low, info
- **Date Filtering**: Filter by 24h, 7d, 30d, or custom date ranges
- **Grouped by Date**: Events organized by day for easy navigation
- **Resolution Tracking**: Track when faults are resolved

### 🚨 Alert Management
- **Active Alerts Dashboard**: Monitor critical system alerts
- **Alert Workflow**: Active → Acknowledged → Resolved
- **Severity-based Prioritization**: Automatic alert creation for critical events
- **Alert Actions**: Acknowledge and resolve alerts with user tracking
- **Alert Statistics**: View active, acknowledged, and resolved counts

### 📈 Reporting Module
- **Pre-built Reports**:
  - Asset Inventory Report
  - Fault Analysis Report
  - Maintenance Schedule
  - Uptime & Availability Report
  - Event Summary Report
- **Visual Analytics**: Charts and graphs for each report type
- **Export Functionality**: Export reports to CSV format
- **Date Range Selection**: Custom date ranges for all reports

### 💾 Data Persistence
- **IndexedDB Storage**: All data stored locally using Dexie.js
- **Offline Support**: Full functionality without internet connection
- **Data Import/Export**: Backup and restore data as JSON/CSV
- **Mock Data Generator**: 500+ assets and 2000+ events for demonstration

## Tech Stack

### Frontend
- **React 18.2** - UI framework
- **TypeScript 5.2** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library patterns

### Mapping
- **Leaflet.js** - Interactive maps
- **react-leaflet** - React components for Leaflet
- **react-leaflet-cluster** - Marker clustering

### Data & State
- **Dexie.js** - IndexedDB wrapper
- **dexie-react-hooks** - React hooks for Dexie
- **date-fns** - Date manipulation

### Visualization
- **Recharts** - Chart library
- **lucide-react** - Icon library

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

#### Windows Users (Easy Setup)

1. Clone the repository:
```bash
git clone <repository-url>
cd railway-asset-manager
```

2. **First-time setup** - Double-click `setup.bat`
   - Checks Node.js installation
   - Installs all dependencies

3. **Run development server** - Double-click `run.bat`
   - Starts the app at http://localhost:5173
   - Auto-installs dependencies if needed

4. **Build for production** - Double-click `build.bat`
   - Creates optimized production build
   - Previews at http://localhost:4173

#### Manual Installation (All Platforms)

1. Clone the repository:
```bash
git clone <repository-url>
cd railway-asset-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
railway-asset-manager/
├── src/
│   ├── components/
│   │   ├── Dashboard/         # Main dashboard with KPIs
│   │   ├── Map/              # Interactive map view
│   │   ├── AssetList/        # Asset inventory list
│   │   ├── AssetDetail/      # Detailed asset view
│   │   ├── Timeline/         # Event timeline
│   │   ├── Alerts/           # Alert management
│   │   ├── Reports/          # Reporting module
│   │   └── ui/               # Reusable UI components
│   ├── db/
│   │   ├── database.ts       # Dexie database schema
│   │   ├── operations.ts     # Database CRUD operations
│   │   └── mockData.ts       # Mock data generator
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── cn.ts             # Class name utilities
│   │   └── formatters.ts     # Data formatting utilities
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Mock Data

The application includes a comprehensive mock dataset:

### Assets (500+)
- **Signals** (150): Main signals, distant signals, shunting signals
- **Balises** (200): Fixed, switchable, and infill balises
- **Axle Counters** (100): Counting heads and evaluation units
- **Switches** (30): Railway points/switches
- **Level Crossings** (15): Road-rail intersections
- **Radio Block Centers** (5): ETCS Level 2 equipment

### Events (2000+)
- Installation events for all assets
- Quarterly maintenance activities
- Semi-annual inspections
- Realistic fault patterns:
  - Communication failures
  - Hardware faults
  - Software errors
  - Environmental issues
  - Power supply problems
- Seasonal patterns (more faults in winter)
- Cascade failures
- Repair and resolution events

### Geographic Coverage
- Railway line: Warsaw-Krakow corridor (~293 km)
- Assets distributed realistically along the line
- Clustering around major stations

## Key Features Explained

### Offline-First Architecture
All data is stored in IndexedDB, allowing the application to work completely offline. Data persists between sessions.

### Real-Time Filtering
All list views support real-time filtering without page reloads. Filters include:
- Asset type
- Operational status
- Date ranges
- Text search (name, serial number, manufacturer, model)

### Color-Coded System
- **Green**: Operational
- **Yellow**: Maintenance required
- **Red**: Fault/Critical
- **Gray**: Offline

### Report Generation
All reports include:
- Visual charts and graphs
- Statistical summaries
- Export to CSV functionality
- Custom date range selection

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Initial Load**: < 2s
- **Asset Rendering**: 500+ assets with clustering
- **Database Operations**: < 50ms for most queries
- **Map Performance**: Smooth panning and zooming with 500+ markers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for mapping functionality
- Recharts for data visualization
- shadcn/ui for component patterns

## Support

For issues and questions, please open an issue on GitHub.

---

**Railway Asset Manager v1.0** - Built with ❤️ for railway infrastructure management
