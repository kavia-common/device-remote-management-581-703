# Realtime Updates - Quick Reference

## Setup (Already Done)

✅ RealtimeProvider integrated in App.js  
✅ Redux actions configured  
✅ Auth/tenant context wired  
✅ Environment variables configured  

## Configuration

```bash
# .env
REACT_APP_REALTIME_MODE=sse          # or 'ws'
REACT_APP_REALTIME_ENDPOINT=/realtime/events
REACT_APP_API_URL=http://localhost:8080/api
```

## Usage in Components

### Get Connection Status

```javascript
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { connectionStatus } = useRealtime();
  // connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  
  return <Badge color={connectionStatus === 'connected' ? 'success' : 'error'} />;
}
```

### Subscribe to Custom Events

```javascript
import { useEffect } from 'react';
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubscribe = subscribe('my_event', (data) => {
      console.log('Event received:', data);
    });
    
    return unsubscribe; // Always cleanup!
  }, [subscribe]);
}
```

### Access Query State (Automatic Updates)

```javascript
import { useSelector } from 'react-redux';
import { selectActiveQueryById, selectRealtimeConnected } from '../store/slices/queriesSlice';

function QueryStatus({ jobId }) {
  const query = useSelector(selectActiveQueryById(jobId));
  const connected = useSelector(selectRealtimeConnected);
  
  return (
    <div>
      <div>Status: {query?.status}</div>
      <div>Progress: {query?.progress}%</div>
      {!connected && <div>⚠️ Live updates unavailable</div>}
    </div>
  );
}
```

### Publish Messages (WebSocket Only)

```javascript
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { publish } = useRealtime();
  
  const sendMessage = () => {
    publish('channel_name', { message: 'Hello' });
  };
}
```

## Event Types

### job_update
Progressive updates during query execution
```json
{
  "jobId": "uuid",
  "status": "processing",
  "progress": 50,
  "message": "Processing device 3 of 5"
}
```

### job_complete
Query finished successfully
```json
{
  "jobId": "uuid",
  "status": "completed",
  "results": { ... },
  "message": "Query completed"
}
```

### job_error
Query failed
```json
{
  "jobId": "uuid",
  "error": "Connection timeout",
  "message": "Failed to connect",
  "details": { ... }
}
```

## Redux Actions

**Automatically dispatched by RealtimeProvider:**

- `handleRealtimeJobUpdate(payload)` - Progress update
- `handleRealtimeJobComplete(payload)` - Completion
- `handleRealtimeJobError(payload)` - Error
- `setRealtimeConnected(boolean)` - Connection status

## Redux Selectors

```javascript
import {
  selectActiveQueries,      // All active queries
  selectActiveQueryById,    // Get query by jobId
  selectQueryResultsById,   // Get results by jobId
  selectRealtimeConnected,  // Connection status
} from '../store/slices/queriesSlice';
```

## Backend Integration

### SSE Endpoint (Recommended)

```
GET /realtime/events?token=<jwt>&tenantId=<id>

Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: job_update
data: {"jobId":"123","status":"processing","progress":50}
```

### WebSocket Endpoint

```
WS /realtime/events?token=<jwt>&tenantId=<id>

{"type":"job_update","data":{"jobId":"123","status":"processing"}}
```

## Common Patterns

### Show Progress Bar

```javascript
function QueryProgressBar({ jobId }) {
  const query = useSelector(selectActiveQueryById(jobId));
  
  if (!query || query.status === 'completed') return null;
  
  return (
    <LinearProgress 
      variant="determinate" 
      value={query.progress || 0} 
    />
  );
}
```

### Notify on Completion

```javascript
function QueryMonitor({ jobId }) {
  const query = useSelector(selectActiveQueryById(jobId));
  const toast = useToast();
  
  useEffect(() => {
    if (query?.status === 'completed') {
      toast.success('Query completed!');
    } else if (query?.status === 'error') {
      toast.error(query.error || 'Query failed');
    }
  }, [query?.status]);
}
```

### Connection Indicator

```javascript
function RealtimeIndicator() {
  const { connectionStatus } = useRealtime();
  
  const colors = {
    connected: 'success',
    disconnected: 'error',
    reconnecting: 'warning',
  };
  
  return (
    <Chip 
      label={connectionStatus} 
      color={colors[connectionStatus]} 
      size="small" 
    />
  );
}
```

## Troubleshooting

| Issue | Check |
|-------|-------|
| Not connecting | Backend running? Endpoint implemented? |
| No events | Tenant ID matches? Event names correct? |
| Memory leak | Cleanup subscriptions in useEffect? |
| Frequent reconnects | Network stable? Backend healthy? |

## Console Logs

Look for these in browser console:

```
[SSE] Connection established
[RealtimeProvider] Connection status: connected
[RealtimeProvider] Job update: {...}
[SSE] Reconnecting in 1000ms...
```

## Best Practices

✅ Always return unsubscribe function  
✅ Use Redux for state, not component state  
✅ Handle disconnected state gracefully  
✅ Don't rely solely on realtime (have fallbacks)  
✅ Clean up subscriptions on unmount  

❌ Don't create multiple client instances  
❌ Don't store large objects in events  
❌ Don't forget to handle errors  
❌ Don't block UI on connection status  

## Testing

```javascript
// Mock for tests
jest.mock('../hooks/useRealtime', () => ({
  useRealtime: () => ({
    connectionStatus: 'connected',
    subscribe: jest.fn(() => () => {}),
    publish: jest.fn(),
  }),
}));
```

## Full Documentation

See `docs/REALTIME_UPDATES.md` for complete documentation.
