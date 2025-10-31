# Multi-Tenant Functionality Guide

## Overview

The Device Remote Management Platform supports multi-tenant architecture, allowing users to manage devices across different organizations or contexts. This guide explains how the tenant functionality works and how to use it.

## Features

### 1. Tenant Switcher Component
- Located in the top navigation bar (AppBar)
- Displays current organization/tenant
- Allows switching between available tenants
- Automatically refreshes data when tenant is changed

### 2. Automatic Header Injection
- All API requests automatically include `X-Tenant-Id` header
- Handled transparently by axios interceptor
- No manual header management required in components

### 3. Data Isolation
- Each tenant has isolated data
- Switching tenants triggers automatic cache invalidation
- All queries are refetched with new tenant context

### 4. Safe Defaults
- If backend doesn't provide tenant list, uses safe defaults
- Single tenant is displayed as a read-only label
- Multiple tenants show as a dropdown selector

## Usage

### For Component Developers

#### Using Tenant-Aware Data Fetching

```javascript
import { useTenantData } from '../hooks/useTenantData';

function MyComponent() {
  // Specify which queries to invalidate on tenant change
  const currentTenant = useTenantData(['devices', 'queries']);
  
  // Your component logic
  // currentTenant will update when user switches tenants
}
```

#### Using Tenant-Aware Query Keys

```javascript
import { useTenantQueryKey } from '../hooks/useTenantData';
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  // Create tenant-aware query key
  const queryKey = useTenantQueryKey(['devices']);
  
  const { data } = useQuery({
    queryKey,
    queryFn: fetchDevices,
  });
}
```

#### Manual Tenant Access

```javascript
import { useSelector } from 'react-redux';
import { selectCurrentTenant } from '../store/slices/authSlice';

function MyComponent() {
  const currentTenant = useSelector(selectCurrentTenant);
  
  // Use currentTenant as needed
}
```

### Setting Tenant Programmatically

```javascript
import { useDispatch } from 'react-redux';
import { setCurrentTenant } from '../store/slices/authSlice';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const handleTenantChange = (newTenantId) => {
    dispatch(setCurrentTenant(newTenantId));
    queryClient.invalidateQueries(); // Refresh all data
  };
}
```

## Backend Integration

### Expected Backend Endpoints

#### GET /api/tenants
Returns list of tenants available to current user:
```json
{
  "tenants": [
    { "id": "tenant-1", "name": "Organization A" },
    { "id": "tenant-2", "name": "Organization B" }
  ]
}
```

#### POST /api/tenants/switch
Switches tenant context:
```json
{
  "tenantId": "tenant-1"
}
```

### Request Header
All authenticated requests include:
```
X-Tenant-Id: <current-tenant-id>
```

Backend should use this header to filter data appropriately.

## State Management

### Redux State Structure
```javascript
{
  auth: {
    user: { /* user data */ },
    token: "jwt-token",
    currentTenant: "tenant-id", // Current tenant ID
    roles: [],
    permissions: []
  }
}
```

### Local Storage
- `currentTenant` - Persisted across sessions
- Restored on app initialization
- Cleared on logout

## Data Refresh Strategy

When tenant is changed:
1. Redux state is updated via `setCurrentTenant` action
2. Tenant ID is persisted to localStorage
3. All React Query caches are invalidated
4. Components automatically refetch with new tenant context
5. Axios interceptor injects new `X-Tenant-Id` header

## UI Behavior

### Single Tenant
- Shows as read-only label with organization icon
- No dropdown displayed

### Multiple Tenants
- Shows as dropdown selector
- Current tenant is pre-selected
- Changing selection triggers data refresh
- Visual indicator in AppBar shows current context

### No Tenants (Default)
- Uses "Default Organization" as fallback
- Prevents app from breaking if backend not ready

## Testing

### Testing Tenant Switching
```javascript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import TenantSwitcher from './TenantSwitcher';

test('displays tenant selector', () => {
  const store = mockStore({
    auth: { currentTenant: 'tenant-1' }
  });
  
  render(
    <Provider store={store}>
      <TenantSwitcher />
    </Provider>
  );
  
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});
```

## Best Practices

1. **Always use tenant-aware query keys** for data that varies by tenant
2. **Invalidate relevant queries** when tenant changes
3. **Don't cache tenant-specific data** without including tenant ID in cache key
4. **Handle tenant-not-found errors** gracefully
5. **Persist tenant selection** to improve UX across sessions

## Troubleshooting

### Data Not Refreshing
- Ensure queries are invalidated on tenant change
- Check that query keys include tenant context

### Header Not Sent
- Verify Redux store has currentTenant set
- Check axios interceptor is properly configured

### Tenant List Empty
- Check backend endpoint returns proper format
- Verify safe defaults are working
- Check browser console for errors

## Future Enhancements

- Tenant-specific theming
- Tenant permissions and role-based access
- Tenant switching confirmation dialog
- Tenant activity logging
- Multi-tenant admin interface
