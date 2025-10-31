# Device Remote Management Platform - Frontend

A modern React-based single-page application (SPA) for managing network devices across multiple protocols including SNMP, WebPA, TR-69/ACS, and TR-369/USP.

## Features

- **Multi-Protocol Support**: Unified interface for SNMP (v2/v3), WebPA, TR-69, and TR-369 protocols
- **User Authentication**: JWT-based authentication with login and registration
- **Device Management**: Full CRUD operations for network devices
- **Protocol Operations**: Execute protocol-specific queries and commands
- **Query History**: Track and review historical queries with export functionality
- **MIB Management**: Upload and manage SNMP MIB files
- **Real-time Updates**: Asynchronous query execution with status monitoring
- **Export Capabilities**: Export query results in CSV and JSON formats
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **State Management**: Redux Toolkit for global state management
- **Data Fetching**: React Query for efficient API calls and caching

## Tech Stack

- **React 18.2** - UI framework
- **React Router 6** - Client-side routing
- **Redux Toolkit** - State management
- **React Query (TanStack Query)** - Server state management
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **date-fns** - Date formatting
- **file-saver** - File export functionality

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── axios.js           # Configured axios instance with JWT interceptors
│   ├── auth.js            # Authentication API calls
│   ├── devices.js         # Device management API calls
│   ├── protocols.js       # Protocol operations API calls
│   ├── config.js          # Configuration management (MIB uploads)
│   └── export.js          # Export functionality API calls
├── components/            # Reusable components
│   ├── Layout.js          # Main layout with navigation
│   └── ProtectedRoute.js  # Route guard for authentication
├── pages/                 # Page components
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration page
│   ├── Dashboard.js       # Dashboard with statistics
│   ├── Devices.js         # Device management page
│   ├── QueryHistory.js    # Query history and results
│   ├── MIBUpload.js       # MIB file management
│   └── protocols/         # Protocol-specific pages
│       ├── SNMPPage.js    # SNMP operations
│       ├── WebPAPage.js   # WebPA operations
│       ├── TR69Page.js    # TR-69 operations
│       └── TR369Page.js   # TR-369/USP operations
├── store/                 # Redux store configuration
│   ├── index.js           # Store configuration
│   └── slices/            # Redux slices
│       ├── authSlice.js   # Authentication state
│       ├── devicesSlice.js # Device state
│       └── queriesSlice.js # Query state
├── theme/                 # Material-UI theme
│   └── index.js           # Theme configuration
├── App.js                 # Main app component with routing
├── index.js               # Application entry point
├── App.css                # Global styles
└── index.css              # Base styles
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Backend API server running (default: http://localhost:8080)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` to set your backend API URL:
```
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_SITE_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=30000
```

### Development

Run the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The build files will be in the `build/` directory.

### Testing

#### Unit & Integration Tests

Run the test suite:
```bash
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### End-to-End (E2E) Tests

E2E tests are written using Playwright and cover critical user flows.

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run E2E tests
npm run e2e

# Run E2E tests in UI mode (interactive)
npm run e2e:ui

# Run E2E tests in CI mode
npm run e2e:ci

# View E2E test report
npm run e2e:report
```

**E2E Test Coverage:**
- Login flow with valid/invalid credentials
- Device search with debounce validation
- Protocol query execution (SNMP, WebPA, TR69, TR369)
- Realtime updates via SSE
- Favorites management
- Query cancellation

For detailed E2E testing documentation, see:
- `e2e/README.md` - Complete E2E testing guide
- `E2E_QUICK_REFERENCE.md` - Quick reference for common tasks

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `REACT_APP_SITE_URL` | Frontend site URL | `http://localhost:3000` |
| `REACT_APP_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `REACT_APP_DEBUG` | Enable debug mode | `false` |

**Note**: Environment variables must be requested from the user. The `.env` file should not be committed to version control. Use `.env.example` as a template.

## Authentication

The application uses JWT-based authentication:

1. **Login**: POST to `/auth/login` with email and password
2. **Token Storage**: JWT token stored in localStorage
3. **Automatic Injection**: Axios interceptor adds token to all requests
4. **Token Expiration**: 401 responses trigger automatic logout and redirect

### Protected Routes

All routes except `/login` and `/register` are protected and require authentication.

## API Integration

The frontend communicates with the backend via REST API. The base URL is configured via `REACT_APP_API_URL`.

### API Structure

- **Authentication**: `/auth/*`
- **Devices**: `/devices/*`
- **SNMP Protocol**: `/protocols/snmp/*`
- **WebPA Protocol**: `/protocols/webpa/*`
- **TR-69 Protocol**: `/protocols/tr69/*`
- **TR-369 Protocol**: `/protocols/tr369/*`
- **Query Management**: `/queries/*`
- **Configuration**: `/config/*`
- **Export**: `/export/*`

## Features Guide

### Device Management

- **Add Device**: Click "Add Device" button on Devices page
- **Edit Device**: Click edit icon next to any device
- **Delete Device**: Click delete icon (with confirmation)
- **View Devices**: Table view with pagination and sorting

### Protocol Operations

Each protocol page provides:
- Operation selection (GET, SET, WALK, etc.)
- Device selection dropdown
- Parameter/OID input fields
- Real-time result display
- Job tracking with Job ID

### Query History

- View all historical queries
- Filter and sort capabilities
- Export results in CSV or JSON format
- View detailed query results

### MIB Management

- Upload SNMP MIB files (.mib, .txt)
- View list of uploaded MIBs
- Delete MIBs when no longer needed

## State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: {...},
    token: "...",
    isAuthenticated: true/false,
    loading: false,
    error: null
  },
  devices: {
    devices: [...],
    stats: {...},
    pagination: {...},
    loading: false,
    error: null
  },
  queries: {
    history: [...],
    activeQueries: {...},
    results: {...},
    pagination: {...},
    loading: false,
    error: null
  }
}
```

## Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

Navigation automatically switches to drawer mode on mobile devices.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React.lazy() (future enhancement)
- React Query caching (5 minutes default)
- Pagination for large datasets
- Debounced search inputs
- Memoized expensive computations

## Security Features

- JWT token authentication
- Automatic token refresh handling
- XSS protection via React's built-in escaping
- CSRF protection via token-based auth
- Secure HTTP-only cookie support (backend)

## Troubleshooting

### Common Issues

1. **Cannot connect to backend**
   - Check `REACT_APP_API_URL` in `.env`
   - Ensure backend server is running
   - Check CORS configuration on backend

2. **Authentication fails**
   - Clear localStorage: `localStorage.clear()`
   - Check token expiration
   - Verify backend authentication endpoint

3. **Build fails**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Check Node.js version (14+)

4. **Queries not executing**
   - Check device configuration
   - Verify protocol support on device
   - Check network connectivity to device

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Add JSDoc comments for public functions
4. Include error handling in all async operations
5. Test on multiple screen sizes
6. Update this README for new features

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact the development team or open an issue in the project repository.
