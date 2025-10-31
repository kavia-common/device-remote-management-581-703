# Realtime Updates Documentation

## Overview

The Device Remote Management platform supports real-time updates via Server-Sent Events (SSE) or WebSocket connections. This enables the frontend to receive immediate notifications about job status changes, query progress, and other events without polling.

## Features

- **Dual Mode Support**: SSE (default) and WebSocket modes
- **JWT Authentication**: Secure connections with JWT bearer tokens
- **Multi-tenant Support**: X-Tenant-Id header integration
- **Auto-Reconnection**: Exponential backoff reconnection strategy
- **Graceful Degradation**: Non-breaking if backend is unavailable
- **Redux Integration**: Automatic state updates via Redux actions
- **Event Types**: job_update, job_complete, job_error

## Configuration

Configure realtime updates via environment variables in `.env`:

```bash
# Realtime mode: 'sse' (default) or 'ws'
REACT_APP_REALTIME_MODE=sse

# Realtime endpoint (relative to API base URL)
REACT_APP_REALTIME_ENDPOINT=/realtime/events

# API base URL
REACT_APP_API_URL=http://localhost:8080/api
```

## Architecture

### Components

1. **SSE/WebSocket Client** (`src/api/realtime.js`)
   - Manages connection lifecycle
   - Handles authentication and tenant context
   - Implements exponential backoff reconnection
   - Provides event subscription interface

2. **RealtimeProvider** (`src/components/RealtimeProvider.js`)
   - React context provider for realtime features
   - Integrates with Redux auth state
   - Dispatches Redux actions for query events
   - Manages connection lifecycle based on authentication

3. **QueriesSlice** (`src/store/slices/queriesSlice.js`)
   - Redux slice with realtime event handlers
   - Merges progress updates for active queries
   - Maintains query history and results
   - Tracks connection status

### Event Flow

```
Backend → SSE/WebSocket → RealtimeProvider → Redux Action → State Update → UI Update
```

## Usage

### Basic Usage (Automatic)

The RealtimeProvider is automatically integrated into the app component tree. When a user logs in, the connection is established automatically with their JWT token and tenant ID.

Query updates are automatically dispatched to Redux and reflected in the UI.

### Custom Event Subscriptions

Use the `useRealtime` hook for custom event handling:

```javascript
import { useEffect } from 'react';
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { subscribe, connectionStatus } = useRealtime();

  useEffect(() => {
    // Subscribe to custom events
    const unsubscribe = subscribe('custom_event', (data) => {
      console.log('Custom event:', data);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      Connection: {connectionStatus}
    </div>
  );
}
```

### Publishing Messages (WebSocket Only)

```javascript
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { publish } = useRealtime();

  const sendMessage = () => {
    publish('my_channel', { message: 'Hello' });
  };

  return <button onClick={sendMessage}>Send</button>;
}
```

## Event Types

### job_update

Sent when a query job is progressing.

**Payload:**
```json
{
  "jobId": "uuid",
  "status": "processing",
  "progress": 45,
  "message": "Processing device 3 of 5",
  "data": {}
}
```

### job_complete

Sent when a query job completes successfully.

**Payload:**
```json
{
  "jobId": "uuid",
  "status": "completed",
  "results": {},
  "message": "Query completed successfully"
}
```

### job_error

Sent when a query job encounters an error.

**Payload:**
```json
{
  "jobId": "uuid",
  "error": "Connection timeout",
  "message": "Failed to query device",
  "details": {}
}
```

## Backend Integration

### SSE Endpoint

**Endpoint:** `GET /realtime/events`

**Query Parameters:**
- `token` (required): JWT authentication token
- `tenantId` (optional): Tenant ID for multi-tenancy

**Response:** Server-Sent Events stream

**Event Format:**
```
event: job_update
data: {"jobId":"123","status":"processing","progress":50}

event: job_complete
data: {"jobId":"123","status":"completed","results":{}}
```

### WebSocket Endpoint

**Endpoint:** `WS /realtime/events`

**Query Parameters:**
- `token` (required): JWT authentication token
- `tenantId` (optional): Tenant ID for multi-tenancy

**Message Format:**
```json
{
  "type": "job_update",
  "data": {
    "jobId": "123",
    "status": "processing",
    "progress": 50
  }
}
```

**Ping/Pong:**
The client sends ping messages every 30 seconds to keep the connection alive.

```json
{"type": "ping"}
```

Server responds with:
```json
{"type": "pong"}
```

## Reconnection Strategy

The client implements exponential backoff for reconnection:

- **Initial Delay**: 1 second
- **Max Delay**: 30 seconds
- **Backoff Multiplier**: 2x

**Example Sequence:**
1. Connection lost
2. Wait 1s → reconnect
3. Connection lost again
4. Wait 2s → reconnect
5. Connection lost again
6. Wait 4s → reconnect
7. ... continues up to 30s max delay

## Error Handling

### Backend Unavailable

If the backend realtime endpoint is not yet implemented, the frontend gracefully continues operation:

- Connection attempts fail silently
- Queries still function via REST API polling
- UI shows "disconnected" status
- No breaking errors or crashes

### Authentication Errors

If the JWT token is invalid or expired:

- Connection is rejected by backend
- Frontend detects 401 error
- User is redirected to login page
- Connection automatically retries after re-authentication

### Network Errors

If network connectivity is lost:

- Client detects connection closure
- Exponential backoff reconnection begins
- UI shows "reconnecting" status
- Connection resumes when network recovers

## Testing

### Manual Testing

1. **Connection Status:**
   - Log in and verify connection status shows "connected"
   - Check browser console for connection logs
   - Verify X-Tenant-Id header is sent (check Network tab)

2. **Event Handling:**
   - Submit a query via protocol pages
   - Watch for realtime updates in Redux DevTools
   - Verify progress updates appear in UI
   - Verify completion updates history and results

3. **Reconnection:**
   - Stop backend server
   - Verify "reconnecting" status appears
   - Restart backend server
   - Verify connection automatically resumes

4. **Tenant Switching:**
   - Switch tenant via TenantSwitcher
   - Verify connection reconnects with new tenant ID
   - Verify only events for current tenant are received

### Automated Testing

See `src/components/__tests__/RealtimeProvider.test.js` for unit tests.

## Troubleshooting

### Connection Not Establishing

**Symptoms:** Connection status stays "disconnected" or "reconnecting"

**Possible Causes:**
1. Backend realtime endpoint not implemented
2. Backend not running
3. CORS issues
4. Invalid authentication token

**Solutions:**
1. Verify backend is running and realtime endpoint exists
2. Check browser console for error messages
3. Verify CORS headers allow SSE/WebSocket connections
4. Try logging out and back in to refresh token

### Events Not Received

**Symptoms:** Connection shows "connected" but no events received

**Possible Causes:**
1. Backend not sending events for this tenant
2. Job ID mismatch
3. Event type mismatch

**Solutions:**
1. Check backend logs to verify events are being sent
2. Verify X-Tenant-Id header matches job tenant
3. Check event type names match exactly (case-sensitive)

### Performance Issues

**Symptoms:** High CPU usage, memory leaks, slow UI

**Possible Causes:**
1. Too many event listeners not cleaned up
2. Large event payloads
3. Rapid event bursts

**Solutions:**
1. Ensure all `subscribe()` calls have matching unsubscribe in cleanup
2. Reduce event payload size on backend
3. Implement event throttling/debouncing

## Migration Guide

### From Polling to Realtime

If you currently use polling for query status:

**Before:**
```javascript
const pollInterval = setInterval(() => {
  dispatch(fetchQueryStatus(jobId));
}, 5000);
```

**After:**
```javascript
// Remove polling - realtime updates handled automatically
// Query status is updated via Redux when events are received
```

### Adding Custom Events

1. **Subscribe to event in component:**
```javascript
const { subscribe } = useRealtime();

useEffect(() => {
  const unsubscribe = subscribe('my_event', (data) => {
    // Handle event
  });
  return unsubscribe;
}, [subscribe]);
```

2. **Add reducer in queriesSlice (if needed):**
```javascript
handleMyCustomEvent: (state, action) => {
  // Update state
}
```

3. **Dispatch from RealtimeProvider (if needed):**
```javascript
client.subscribe('my_event', (data) => {
  dispatch(handleMyCustomEvent(data));
});
```

## Best Practices

1. **Always Clean Up Subscriptions:**
   ```javascript
   useEffect(() => {
     const unsubscribe = subscribe('event', handler);
     return unsubscribe; // Always return unsubscribe
   }, []);
   ```

2. **Handle Connection States:**
   ```javascript
   const { connectionStatus } = useRealtime();
   
   if (connectionStatus === 'disconnected') {
     return <Alert>Realtime updates unavailable</Alert>;
   }
   ```

3. **Don't Rely Solely on Realtime:**
   - Always provide fallback to REST API polling
   - Realtime should enhance, not replace, API calls
   - Handle cases where backend doesn't support realtime

4. **Minimize Event Payload:**
   - Send only necessary data in events
   - Reference full data by ID if needed
   - Avoid sending large objects repeatedly

5. **Use Redux for State:**
   - Don't store event data in component state
   - Dispatch to Redux for persistence
   - Use selectors to access data

## Future Enhancements

Planned improvements:

- [ ] Event filtering by subscription channels
- [ ] Binary message support for large payloads
- [ ] Compression for SSE streams
- [ ] Offline queue for messages when disconnected
- [ ] Presence tracking (online/offline users)
- [ ] Broadcast channels for multi-tab sync
- [ ] Rate limiting and backpressure handling
- [ ] Enhanced error recovery strategies

## References

- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Context](https://react.dev/reference/react/useContext)
