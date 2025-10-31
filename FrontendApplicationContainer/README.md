# Frontend Application

This project powers the Device Remote Management platform UI.

## Environment configuration

Copy `.env.example` to `.env` and adjust as needed:

- REACT_APP_API_URL: Base URL of the backend API (e.g., http://localhost:8080/api/v1). All REST requests are sent to this base URL.
- REACT_APP_SITE_URL: Public site URL of the frontend (e.g., http://localhost:3000). Used by backend for email redirect links.
- REACT_APP_API_TIMEOUT: Axios request timeout in milliseconds (default 10000).
- REACT_APP_REALTIME_PROTOCOL: Realtime protocol strategy. Supported: sse (default). ws is reserved for future WebSocket support.
- REACT_APP_DEBUG: Set to "true" to enable verbose logging for realtime.

## HTTP client behavior

A single axios instance is used:
- Adds Authorization: Bearer <token> if a token is present in Redux state or localStorage.
- Adds X-Tenant-Id header if a tenant is selected.
- On 401 responses, it dispatches logout to clear local auth.
- Errors are normalized to shape:
  { error: { code, message, details?, timestamp, path? } }
- Pagination responses follow:
  { page, pageSize, totalPages, totalItems, hasNext, hasPrevious }

## Realtime (SSE)

The app connects to GET /realtime/sse from the backend base URL and listens to:
- job_submitted
- job_progress
- job_completed
- job_failed
- favorite_updated

Automatic reconnection is implemented with a retry delay (default 3s). A wrapper is provided to enable future WebSocket support via REACT_APP_REALTIME_PROTOCOL.

## Protocol job flow

Protocol operations (SNMP/WebPA/TR69/TR369) submit jobs via REST and receive:
- { jobId }

Progress and completion are delivered via realtime events. Jobs can be canceled via POST /jobs/{jobId}/cancel or /queries/{jobId}/cancel depending on endpoint.

## Scripts

- npm start — dev server
- npm test — run tests
- npm run build — production build
