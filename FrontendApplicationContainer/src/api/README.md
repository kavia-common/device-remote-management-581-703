# API Layer Documentation

## Overview

The API layer provides a unified interface for all backend communications, with automatic fallback to mock mode when no backend is configured. This ensures the frontend can be developed and tested independently.

## Architecture

### Base Configuration

- **Base URL**: Configured via `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL` environment variables
- **Mock Mode**: Automatically activated when both env vars are empty or unset
- **Authentication**: JWT tokens attached via `Authorization: Bearer <token>` header
- **Error Handling**: Centralized in `client.js` with automatic 401 refresh attempts

### Modules

#### 1. **client.js**
Core axios instance with request/response interceptors
- Auto-attaches JWT from Redux store
- Handles 401 responses with token refresh logic
- Queues requests during refresh
- Dispatches errors to Redux UI slice

#### 2. **auth.js**
Authentication operations
- `loginWithPassword({ email, password })` - Login
- `refreshAccessToken()` - Token refresh
- `loadPersistedAuth()` - Load from localStorage
- `persistAuth()` - Save to localStorage
- `clearPersistedAuth()` - Clear tokens

#### 3. **devices.js**
Device management operations
- `listDevices({ page, pageSize, sort, filter })` - Paginated device list
- `getDeviceById(deviceId)` - Device details
- `createDevice(deviceData)` - Create device
- `updateDevice(deviceId, deviceData)` - Update device
- `deleteDevice(deviceId)` - Delete device

#### 4. **protocols/snmp.js**
SNMP protocol operations
- `snmpGet({ deviceId, oid, version, community })` - SNMP GET
- `snmpSet({ deviceId, oid, value, valueType, version, community })` - SNMP SET
- `snmpWalk({ deviceId, oid, version, community, maxRepetitions })` - SNMP WALK
- `snmpBulkGet({ deviceId, oids, version, community })` - SNMP BULK GET

#### 5. **protocols/webpa.js**
WebPA protocol operations
- `webpaGetParameter({ deviceId, parameter })` - Get parameter value
- `webpaSetParameter({ deviceId, parameter, value, dataType })` - Set parameter
- `webpaGetAttributes({ deviceId, parameter })` - Get parameter attributes
- `webpaSetAttributes({ deviceId, parameter, attributes })` - Set attributes
- `webpaGetParameterNames({ deviceId, path, nextLevel })` - List parameters

#### 6. **protocols/tr069.js**
TR-069/ACS protocol operations
- `tr069GetParameterValues({ deviceId, parameters })` - Get parameters
- `tr069SetParameterValues({ deviceId, parameters })` - Set parameters
- `tr069GetParameterNames({ deviceId, path, nextLevel })` - List parameters
- `tr069Reboot({ deviceId })` - Reboot device
- `tr069FactoryReset({ deviceId })` - Factory reset
- `tr069Download({ deviceId, fileType, url, username, password })` - Firmware/config download
- `tr069GetTaskStatus({ taskId })` - Check async task status

#### 7. **protocols/tr369.js**
TR-369/USP protocol operations
- `tr369Get({ deviceId, paths })` - GET operation
- `tr369Set({ deviceId, parameters })` - SET operation
- `tr369Add({ deviceId, path, parameters })` - ADD object instance
- `tr369Delete({ deviceId, paths })` - DELETE object instance
- `tr369Operate({ deviceId, command, commandKey, inputArgs })` - Execute command
- `tr369GetSupportedDM({ deviceId, paths, firstLevelOnly })` - Get data model info
- `tr369GetInstances({ deviceId, path, firstLevelOnly })` - Get instances

#### 8. **configuration.js**
Configuration management
- `uploadMIB({ file, deviceId, description })` - Upload MIB file
- `listMIBs({ page, pageSize })` - List MIBs
- `deleteMIB(mibId)` - Delete MIB
- `getParameterMetadata({ protocol, parameter })` - Get param metadata
- `saveConfigurationTemplate({ name, deviceId, protocol, parameters })` - Save template
- `listConfigurationTemplates({ page, pageSize })` - List templates

#### 9. **activity.js**
Activity logging and query history tracking
- `buildQueryRecord({ protocol, target, action, params, status, duration, response, error, user, deviceId, operation, requestId })` - Build normalized query record
- `createQueryLog(payload)` - Create query log entry (POST to /queries or localStorage fallback)
- `createQueryResult(payload)` - Create detailed result entry (POST to /queries/:id/results)
- `getLocalHistoryRecords()` - Retrieve local history from localStorage (mock mode)
- `clearLocalHistory()` - Clear local history (mock mode)

**Automatic Activity Logging:**
All protocol pages (SNMP, WebPA, TR-069, TR-369) automatically log operation executions to query history:
- Logs happen after operation completion (success or failure)
- Non-blocking - failures to log do not affect protocol operations
- Captures: protocol, device/target, action, parameters, status, duration, response/error, user, timestamp
- In mock mode: persists to `localStorage` under key `dmgr.history` (max 100 entries)
- In real mode: POSTs to backend `/queries` endpoint

**QueryRecord Schema:**
```javascript
{
  id: 'qry-<timestamp>-<random>',          // Unique ID
  protocol: 'snmp|webpa|tr069|tr369',      // Protocol name
  deviceId: 'device-id',                    // Device identifier
  target: '192.168.1.1',                    // Target (IP/MAC/serial)
  operation: 'GET|SET|WALK|...',            // Operation type
  action: 'snmpGet|webpaSetParameter|...',  // Action method name
  parameters: { ... },                      // Request parameters
  status: 'success|failed|pending',         // Execution status
  duration: 1234,                           // Duration in ms
  response: { ... } | null,                 // Response payload (null if failed)
  error: 'error message' | null,            // Error message (null if success)
  user: 'user@example.com',                 // User who executed
  executedAt: '2024-01-01T00:00:00Z',       // ISO timestamp
  isFavorite: false,                        // Favorite flag
  requestId: 'task-123' | null,             // Backend request ID if available
  resultSummary: 'Retrieved 10 OID(s)'      // Brief result summary
}
```

**LocalStorage Mock Fallback:**
When `REACT_APP_API_BASE` is not set, activity logging uses localStorage:
- Key: `dmgr.history`
- Format: JSON array of QueryRecord objects
- Max entries: 100 (FIFO)
- Accessible via `getLocalHistoryRecords()` helper
- QueryHistory page reads from this storage automatically in mock mode

#### 10. **queries.js**
Query management and history
- `saveQuery({ name, protocol, deviceId, parameters, isFavorite })` - Save query
- `listQueries({ page, pageSize, favorites })` - List saved queries (reads from localStorage in mock mode)
- `getQueryById(queryId)` - Get query details
- `deleteQuery(queryId)` - Delete query (removes from localStorage in mock mode)
- `toggleFavorite(queryId, isFavorite)` - Toggle favorite (updates localStorage in mock mode)
- `getQueryHistory({ page, pageSize, protocol, deviceId, status, search, dateFrom, dateTo, sort })` - Query history with filters (reads from localStorage in mock mode)
- `rerunQuery(queryId)` - Rerun a previous query
- `addLocalQueryRecord(record)` - Add record to localStorage (helper for consistency)

**Query History Endpoints:**
- `POST /queries` - Create query log entry
  - Body: QueryRecord payload
  - Returns: `{ success, id, message }`
  - **Automatic**: Called by protocol pages after each operation

- `POST /queries/:id/results` - Create detailed result entry (optional)
  - Body: `{ queryId, ...resultData }`
  - Returns: `{ success, message }`
  - **Note**: Only used when backend separates query metadata from results

- `GET /queries/history` - Get paginated query execution history
  - Query params: `page`, `pageSize`, `protocol`, `deviceId`, `status`, `search`, `dateFrom`, `dateTo`, `sort`
  - Returns: `{ page, pageSize, totalPages, totalItems, items: [...] }`
  - Each item includes: `id`, `protocol`, `deviceId`, `target`, `operation`, `action`, `parameters`, `status`, `duration`, `user`, `executedAt`, `response`, `error`, `isFavorite`

- `GET /queries/:id` - Get specific query details
  - Returns full query object with request/response payloads

- `POST /queries/:id/rerun` - Rerun a query with same parameters
  - Returns: `{ success, queryId, status, message }`

- `PATCH /queries/:id/favorite` or `POST /favorites` - Toggle favorite status
  - Body: `{ isFavorite: true/false }`
  - Returns: `{ success, queryId, isFavorite }`

- `DELETE /favorites/:id` - Remove from favorites (alternative endpoint)
  - Returns: `{ success }`

**Configuration Notes:**
- All query endpoints support mock fallback when `REACT_APP_API_BASE` is not set
- Mock mode stores history in localStorage (`dmgr.history`) with QueryRecord schema
- Protocol pages automatically log all operations (SNMP, WebPA, TR-069, TR-369)
- Logging is non-blocking - errors are console.warn'd but don't affect operations
- Filters work in both mock and real modes
- URL query parameters are persisted for shareable views
- Client-side table state (page, pageSize, sort, filters) persisted in URL for deep linking
- Rerun functionality pre-fills protocol page forms with stored parameters

#### 11. **exports.js**
Export operations
- `exportResults({ format, data, filename })` - Export results (CSV/JSON/XML)
- `getExportHistory({ page, pageSize })` - Export history
- `scheduleExport({ format, query, schedule, recipients })` - Schedule periodic exports

#### 12. **mockApi.js**
Mock implementations for development
- All mock functions return realistic data with delays
- Auto-used when `REACT_APP_API_BASE` is not set

## Configuration

### Environment Variables

```bash
# Required for real backend
REACT_APP_API_BASE=https://api.example.com/api/v1

# Or alternative
REACT_APP_BACKEND_URL=https://api.example.com/api/v1

# Auth endpoints (optional, have defaults)
REACT_APP_AUTH_LOGIN_PATH=/auth/login
REACT_APP_AUTH_REFRESH_PATH=/auth/refresh

# Health check (optional, default: /health)
REACT_APP_HEALTHCHECK_PATH=/healthz
```

### Switching Between Real and Mock

1. **Mock Mode** (default for development):
   - Leave `REACT_APP_API_BASE` empty or unset
   - All API calls use local mock implementations
   - No backend required

2. **Real Backend**:
   - Set `REACT_APP_API_BASE=https://your-backend-url`
   - Ensure backend CORS allows frontend origin
   - Backend must implement expected endpoints (see OpenAPI spec)

## Backend Requirements

When connecting to a real backend, ensure:

1. **Authentication**:
   - `POST /auth/login` accepts `{email, password}`
   - Returns `{access_token|token, refresh_token?, user?}`
   - JWT format for access_token

2. **Token Refresh** (optional but recommended):
   - `POST /auth/refresh` accepts `{refresh_token}`
   - Returns `{access_token|token, refresh_token?}`

3. **CORS**:
   - Allow frontend origin
   - Allow credentials
   - Expose auth headers if needed

4. **Endpoints**:
   - Follow REST conventions
   - Return consistent error format (see OpenAPI spec)
   - Support pagination with `page`, `pageSize` params
   - Return `{page, pageSize, totalPages, totalItems, items}` for lists

## Error Handling

All API errors are:
1. Caught by axios interceptor
2. Formatted to consistent structure
3. Displayed via Redux snackbar
4. Returned as rejected promises

Error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": ["detail1", "detail2"],
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/endpoint"
  }
}
```

## Usage Examples

### In Components

```javascript
import { listDevices, snmpGet } from '../api';
import { useQuery } from 'react-query';

// Using React Query
const { data, isLoading } = useQuery(
  ['devices', page],
  () => listDevices({ page, pageSize: 10 })
);

// Direct usage
const handleSnmpQuery = async () => {
  try {
    const result = await snmpGet({
      deviceId: 'dev-123',
      oid: '1.3.6.1.2.1.1.1.0',
      version: 'v2c',
      community: 'public'
    });
    console.log('SNMP result:', result);
  } catch (err) {
    // Error already shown via snackbar
    console.error(err);
  }
};
```

### Type Safety

All functions include JSDoc comments for IDE autocomplete and type checking.

## Testing

Mock mode allows full frontend testing without backend:
- Predictable responses
- Configurable delays
- Realistic data structures
- Edge cases (errors, empty results)

## Future Enhancements

- WebSocket support for real-time updates
- Request caching layer
- Retry logic for failed requests
- Request deduplication
- Optimistic updates
