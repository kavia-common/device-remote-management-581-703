# Device Remote Management - Frontend Application

A modern React-based frontend application for the Device Remote Management platform, providing a unified interface for managing network devices across multiple protocols (SNMP, WebPA, TR69/ACS, TR369/USP).

## 🚀 Features

### Core Functionality
- **Multi-Protocol Support**: Unified interface for SNMP, WebPA, TR69/ACS, and TR369/USP protocols
- **Device Management**: Add, edit, delete, and monitor network devices
- **Real-time Operations**: Non-blocking query execution with progress indicators
- **Query History**: Track and manage all protocol operations
- **User Settings**: Customizable preferences and configuration

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level access control
- **Automatic Token Refresh**: Seamless session management
- **Secure API Communication**: Bearer token authentication for all API calls

### User Interface
- **Material-UI Design**: Modern, responsive UI components
- **Dark Theme**: Professional dark theme with KAVIA branding
- **Responsive Layout**: Mobile, tablet, and desktop support
- **Navigation**: Intuitive sidebar navigation with active state indicators
- **Real-time Status**: Backend health monitoring in header

### State Management
- **Redux Toolkit**: Efficient state management
- **React Query**: Powerful data fetching and caching
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error states and user feedback

## 🏗️ Architecture

### Technology Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript Support**: Ready for TypeScript migration
- **Material-UI v5**: Component library with theming
- **Redux Toolkit**: State management
- **React Query**: Server state management
- **React Router v6**: Modern routing
- **Axios**: HTTP client with interceptors

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   └── Layout/          # Layout components
├── pages/               # Page components
│   ├── Login/          # Authentication page
│   ├── Devices/        # Device management
│   ├── Protocols/      # Protocol operations
│   ├── History/        # Query history
│   └── Settings/       # User settings
├── services/           # API services and configuration
├── store/              # Redux store and slices
│   └── slices/         # Redux state slices
├── App.js              # Main application component
├── App.css             # Global styles and theme
└── index.js            # Application entry point
```

## 🛠️ Development

### Prerequisites
- Node.js 16+ and npm
- Backend API running on port 3001 (or configured endpoint)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:

```env
# API Configuration
REACT_APP_API_BASE=http://localhost:3001/api/v1
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3001

# Environment
REACT_APP_NODE_ENV=development
REACT_APP_PORT=3000
```

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## 📱 Pages & Features

### Login Page (`/login`)
- **Username/Password Authentication**: Secure login form
- **JWT Token Management**: Automatic token storage and refresh
- **Redirect Handling**: Return to intended page after login
- **Error Handling**: Clear error messages for failed authentication

### Devices Page (`/devices`)
- **Device Registry**: View all registered devices
- **CRUD Operations**: Add, edit, delete devices
- **Protocol Support**: SNMP, WebPA, TR69, TR369 device types
- **Pagination**: Efficient handling of large device lists
- **Search & Filter**: Find devices quickly
- **Status Monitoring**: Real-time device status indicators

### Protocols Page (`/protocols`)
- **Tabbed Interface**: Separate tabs for each protocol
- **SNMP Operations**: OID queries with MIB support
- **WebPA Queries**: Parameter-based device queries
- **TR69/ACS Integration**: TR-181 parameter operations
- **TR369/USP Support**: Modern USP protocol queries
- **Real-time Results**: Live query execution and results

### History Page (`/history`)
- **Query Tracking**: Complete history of all operations
- **Search & Filter**: Find specific queries
- **Export Functionality**: Export history to CSV
- **Detailed View**: Full query details and results
- **Performance Metrics**: Execution time tracking

### Settings Page (`/settings`)
- **User Profile**: Personal information management
- **Notifications**: Email and alert preferences
- **Theme Settings**: UI customization options
- **Security Settings**: Session timeout and 2FA
- **System Information**: Version and environment details

## 🔧 API Integration

### Backend Communication
- **RESTful APIs**: Full CRUD operations via REST
- **Authentication**: JWT Bearer token authentication
- **Error Handling**: Automatic 401 handling and logout
- **Health Monitoring**: Real-time backend status checks

### Supported Endpoints
```typescript
// Authentication
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET /auth/me

// Devices
GET /devices
POST /devices
PUT /devices/:id
DELETE /devices/:id

// Protocols
GET /protocols/snmp/:deviceId
GET /protocols/webpa/:deviceId
GET /protocols/tr69/:deviceId
GET /protocols/tr369/:deviceId

// History & Settings
GET /query-history
GET /user/settings
PUT /user/settings

// Health Check
GET /health
```

## 🎨 Theming & Styling

### Design System
- **KAVIA Branding**: Orange primary color (#E87A41)
- **Dark Theme**: Professional dark mode
- **Material Design**: Consistent component styling
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance ready

### Custom Styling
- **CSS Variables**: Theme-aware color system
- **Material-UI Overrides**: Consistent brand styling
- **Inter Font**: Modern typography
- **Icon Library**: Material Icons integration

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure authentication tokens
- **Automatic Refresh**: Seamless token renewal
- **Secure Storage**: Memory-based token storage
- **Route Protection**: Authenticated route guards

### API Security
- **Bearer Authentication**: All API calls authenticated
- **HTTPS Ready**: SSL/TLS support
- **CORS Handling**: Cross-origin request management
- **Error Sanitization**: Secure error messages

## 🚀 Deployment

### Production Build
```bash
# Create optimized build
npm run build

# Serve with static server
npx serve -s build
```

### Environment Variables
Configure production environment:
- `REACT_APP_API_BASE` - Production API endpoint
- `REACT_APP_BACKEND_URL` - Backend service URL
- `REACT_APP_NODE_ENV` - Set to 'production'

### Docker Support
Ready for containerization with provided Dockerfile patterns.

## 🧪 Testing

### Test Coverage
- **Component Tests**: React Testing Library
- **Integration Tests**: API integration testing
- **E2E Ready**: Prepared for Cypress/Playwright
- **CI/CD**: Non-interactive test mode

### Running Tests
```bash
# Run all tests
npm test

# Run tests in CI mode
CI=true npm test

# Watch mode for development
npm run test:watch
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Route-based code splitting
- **React Query Caching**: Intelligent API caching
- **Memoization**: React.memo and useMemo optimization
- **Bundle Optimization**: Tree shaking and minification

### Monitoring
- **Health Checks**: Real-time backend monitoring
- **Error Boundaries**: Graceful error handling
- **Performance Metrics**: Web Vitals ready

## 🤝 Contributing

### Development Guidelines
1. Follow ESLint configuration
2. Use Prettier for code formatting
3. Write tests for new features
4. Follow Material-UI patterns
5. Maintain responsive design

### Code Style
- **Functional Components**: Use React hooks
- **TypeScript Ready**: Prepared for TS migration
- **Documentation**: Document public interfaces
- **Error Handling**: Comprehensive error states

## 📚 Documentation

### Component Documentation
All public interfaces are documented with JSDoc comments and PUBLIC_INTERFACE markers.

### API Documentation
Refer to backend OpenAPI specification for complete API documentation.

## 🔄 Version History

- **v1.0.0** - Initial implementation with full feature set
- Multi-protocol support (SNMP, WebPA, TR69, TR369)
- Authentication and authorization
- Device management and protocol operations
- Query history and user settings
- Material-UI responsive design

## 📞 Support

For technical support and feature requests, contact the development team or refer to the project documentation.
