# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This frontend application now supports Role-Based Access Control (RBAC) with roles, permissions, and tenant management. The implementation is designed to be backward-compatible with existing authentication systems that don't yet provide RBAC metadata.

## Architecture

### State Management

The authentication state in Redux now includes:
- `roles`: Array of role strings assigned to the user
- `permissions`: Array of permission strings granted to the user
- `currentTenant`: Current tenant identifier (for multi-tenant support)

### Components

1. **Enhanced ProtectedRoute** (`src/components/ProtectedRoute.js`)
   - Protects routes based on authentication, roles, and permissions
   - Supports both "any" and "all" matching modes
   - Configurable redirect paths and fallback components

2. **withPermission HOC** (`src/components/withPermission.js`)
   - Higher-order component for wrapping components with permission checks
   - Useful for conditionally rendering entire components

3. **WithPermission Component** (`src/components/withPermission.js`)
   - Declarative component for conditionally rendering children
   - Ideal for inline permission checks in JSX

4. **Permissions Utility** (`src/utils/permissions.js`)
   - Pure functions for checking roles and permissions
   - Pre-defined permission and role constants
   - Can be used outside of React components

## Usage Examples

### Protecting Routes

#### Simple Authentication Check
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

#### Require Specific Role
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

#### Require Multiple Roles (any)
```jsx
<Route
  path="/management"
  element={
    <ProtectedRoute requiredRoles={['admin', 'operator']}>
      <ManagementPanel />
    </ProtectedRoute>
  }
/>
```

#### Require All Roles
```jsx
<Route
  path="/super-admin"
  element={
    <ProtectedRoute 
      requiredRoles={['admin', 'superuser']} 
      requireAllRoles={true}
    >
      <SuperAdminPanel />
    </ProtectedRoute>
  }
/>
```

#### Require Permissions
```jsx
<Route
  path="/devices"
  element={
    <ProtectedRoute requiredPermissions={['device:read']}>
      <Devices />
    </ProtectedRoute>
  }
/>
```

#### Custom Fallback
```jsx
<Route
  path="/sensitive"
  element={
    <ProtectedRoute 
      requiredRoles={['admin']}
      fallback={<div>You need admin access</div>}
    >
      <SensitiveData />
    </ProtectedRoute>
  }
/>
```

### Conditional Rendering with WithPermission

#### Hide UI Elements
```jsx
import { WithPermission } from '../components/withPermission';
import { PERMISSIONS } from '../utils/permissions';

function DeviceActions() {
  return (
    <div>
      <WithPermission requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}>
        <Button onClick={handleEdit}>Edit</Button>
      </WithPermission>
      
      <WithPermission requiredPermissions={[PERMISSIONS.DEVICE_DELETE]}>
        <Button onClick={handleDelete}>Delete</Button>
      </WithPermission>
    </div>
  );
}
```

#### With Fallback Message
```jsx
<WithPermission 
  requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}
  fallback={<Tooltip title="You don't have permission to add devices"><span><Button disabled>Add Device</Button></span></Tooltip>}
>
  <Button onClick={handleAdd}>Add Device</Button>
</WithPermission>
```

### Using withPermission HOC

```jsx
import { withPermission } from '../components/withPermission';
import { PERMISSIONS } from '../utils/permissions';

const AdminButton = ({ onClick }) => (
  <Button onClick={onClick}>Admin Action</Button>
);

// Wrap component with permission check
const ProtectedAdminButton = withPermission(AdminButton, {
  requiredRoles: ['admin'],
  fallback: <Button disabled>Admin Action (No Access)</Button>
});

// Use in your component
function MyComponent() {
  return <ProtectedAdminButton onClick={handleAction} />;
}
```

### Using Selectors in Components

```jsx
import { useSelector } from 'react-redux';
import { selectHasPermission, selectHasRole } from '../store/slices/authSlice';
import { PERMISSIONS, ROLES } from '../utils/permissions';

function MyComponent() {
  const canWrite = useSelector(selectHasPermission(PERMISSIONS.DEVICE_WRITE));
  const isAdmin = useSelector(selectHasRole(ROLES.ADMIN));
  
  return (
    <div>
      {canWrite && <Button>Edit</Button>}
      {isAdmin && <Button>Admin Settings</Button>}
    </div>
  );
}
```

### Using Utility Functions

```jsx
import { hasPermission, hasAnyRole } from '../utils/permissions';

function processAction(user) {
  if (hasPermission(user.permissions, 'device:write')) {
    // Perform write operation
  }
  
  if (hasAnyRole(user.roles, ['admin', 'operator'])) {
    // Admin or operator action
  }
}
```

## Predefined Constants

### Permissions

Available in `PERMISSIONS` object from `src/utils/permissions.js`:

- `DEVICE_READ`: 'device:read'
- `DEVICE_WRITE`: 'device:write'
- `DEVICE_DELETE`: 'device:delete'
- `DEVICE_CONFIGURE`: 'device:configure'
- `QUERY_READ`: 'query:read'
- `QUERY_WRITE`: 'query:write'
- `QUERY_DELETE`: 'query:delete'
- `MIB_UPLOAD`: 'mib:upload'
- `MIB_DELETE`: 'mib:delete'
- `USER_READ`: 'user:read'
- `USER_WRITE`: 'user:write'
- `USER_DELETE`: 'user:delete'
- `ADMIN_ACCESS`: 'admin:access'

### Roles

Available in `ROLES` object from `src/utils/permissions.js`:

- `ADMIN`: 'admin'
- `USER`: 'user'
- `OPERATOR`: 'operator'
- `VIEWER`: 'viewer'

## Backend Integration

### Expected User Object Format

The backend should return user data with the following structure:

```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user", "operator"],
    "permissions": ["device:read", "device:write", "query:read"],
    "currentTenant": "tenant-abc"
  },
  "token": "jwt-token-here"
}
```

### API Endpoints

1. **Login** (`POST /auth/login`)
   - Should return user object with roles/permissions in the response

2. **Get Current User** (`GET /auth/me`)
   - Should return fresh user data including roles/permissions
   - Called via `fetchCurrentUser` thunk to refresh RBAC data

### Hydrating RBAC Data

To fetch fresh RBAC data from the backend:

```jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  useEffect(() => {
    // Fetch current user data on app load if authenticated
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);
  
  return <div>...</div>;
}
```

## Backward Compatibility

The implementation is fully backward-compatible:

1. **No RBAC fields**: If the backend doesn't provide roles/permissions, they default to empty arrays
2. **No permission checks**: Routes and components without permission requirements work as before
3. **Gradual migration**: You can add RBAC checks incrementally without breaking existing functionality

### Example: Graceful Degradation

```jsx
// This still works even if roles/permissions are not provided
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// This only restricts access if roles are present
<ProtectedRoute requiredRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>
```

## Testing

All RBAC functionality includes comprehensive unit tests:

- `src/store/slices/__tests__/test_authSlice.js` - Redux state management tests
- `src/components/__tests__/test_ProtectedRoute.js` - Route protection tests
- `src/components/__tests__/test_withPermission.js` - HOC and component tests
- `src/utils/__tests__/test_permissions.js` - Utility function tests

Run tests with:
```bash
npm test
```

## Best Practices

1. **Use constants**: Always use `PERMISSIONS` and `ROLES` constants instead of hardcoded strings
2. **Fallback UX**: Provide clear feedback when users lack permissions (tooltips, disabled states)
3. **Server-side validation**: NEVER rely solely on frontend checks - always validate on the backend
4. **Fetch fresh data**: Call `fetchCurrentUser()` after login or when roles might have changed
5. **Minimize checks**: Don't over-use permission checks - gate major actions, not every button
6. **Test thoroughly**: Test both authorized and unauthorized scenarios

## Migration Checklist

To add RBAC to an existing page:

1. ✅ Import required utilities
   ```jsx
   import { WithPermission } from '../components/withPermission';
   import { PERMISSIONS } from '../utils/permissions';
   ```

2. ✅ Identify destructive or sensitive actions (delete, edit, create, configure)

3. ✅ Wrap those actions with `WithPermission`
   ```jsx
   <WithPermission requiredPermissions={[PERMISSIONS.DEVICE_DELETE]}>
     <Button onClick={handleDelete}>Delete</Button>
   </WithPermission>
   ```

4. ✅ Provide user-friendly fallbacks (tooltips on disabled buttons)

5. ✅ Test with different permission sets

## Troubleshooting

### Permissions not loading
- Check that backend returns roles/permissions in the user object
- Verify localStorage contains updated user data
- Call `dispatch(fetchCurrentUser())` to refresh

### Protected route always redirects
- Ensure user is authenticated first
- Check that roles/permissions are correctly set in state
- Verify the route requirements match user's actual roles/permissions

### Components not re-rendering
- Make sure you're using Redux selectors (`useSelector`)
- Check that state updates are triggering properly
- Verify component is wrapped in Redux `<Provider>`

## Future Enhancements

Possible future improvements:

- Dynamic permission loading from backend configuration
- Permission inheritance and hierarchies
- Temporary permission grants
- Permission audit logging
- Multi-tenant permission isolation
- Role management UI
- Permission debugging tools

## Support

For questions or issues with RBAC implementation, please refer to:
- This guide
- Source code comments (all public functions are documented)
- Unit tests for usage examples
- Backend API documentation for data format requirements
