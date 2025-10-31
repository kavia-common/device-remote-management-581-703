# RBAC Quick Reference Card

## Import Statements

```jsx
// Components
import ProtectedRoute from './components/ProtectedRoute';
import { WithPermission, withPermission } from './components/withPermission';

// Selectors
import { 
  selectHasRole, 
  selectHasPermission,
  selectHasAnyRole,
  selectHasAllRoles,
  selectHasAnyPermission,
  selectHasAllPermissions 
} from './store/slices/authSlice';

// Utilities
import { PERMISSIONS, ROLES, hasPermission, hasRole } from './utils/permissions';
```

## 1. Protect Routes

```jsx
// Simple auth check
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Require role (any)
<Route path="/admin" element={
  <ProtectedRoute requiredRoles={['admin', 'superuser']}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Require all roles
<Route path="/special" element={
  <ProtectedRoute 
    requiredRoles={['admin', 'verified']} 
    requireAllRoles={true}
  >
    <SpecialPanel />
  </ProtectedRoute>
} />

// Require permission
<Route path="/devices" element={
  <ProtectedRoute requiredPermissions={['device:read']}>
    <Devices />
  </ProtectedRoute>
} />

// Custom fallback
<Route path="/sensitive" element={
  <ProtectedRoute 
    requiredRoles={['admin']}
    fallback={<div>Access Denied</div>}
  >
    <SensitiveData />
  </ProtectedRoute>
} />
```

## 2. Conditional Rendering - Component

```jsx
// Hide button without permission
<WithPermission requiredPermissions={[PERMISSIONS.DEVICE_DELETE]}>
  <Button onClick={handleDelete}>Delete</Button>
</WithPermission>

// Show disabled button with tooltip
<WithPermission 
  requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}
  fallback={
    <Tooltip title="No permission">
      <span>
        <Button disabled>Edit</Button>
      </span>
    </Tooltip>
  }
>
  <Button onClick={handleEdit}>Edit</Button>
</WithPermission>

// Multiple permissions (any)
<WithPermission requiredPermissions={['device:write', 'device:admin']}>
  <Button>Modify Device</Button>
</WithPermission>

// Multiple roles (all)
<WithPermission 
  requiredRoles={['admin', 'verified']}
  requireAllRoles={true}
>
  <SecretFeature />
</WithPermission>
```

## 3. Conditional Rendering - HOC

```jsx
const AdminButton = ({ onClick }) => (
  <Button onClick={onClick}>Admin Action</Button>
);

// Wrap component
const ProtectedButton = withPermission(AdminButton, {
  requiredRoles: ['admin'],
  fallback: <Button disabled>Admin Action</Button>
});

// Use in render
<ProtectedButton onClick={handleAction} />
```

## 4. Using Selectors

```jsx
import { useSelector } from 'react-redux';

function MyComponent() {
  // Check single permission
  const canWrite = useSelector(selectHasPermission(PERMISSIONS.DEVICE_WRITE));
  
  // Check single role
  const isAdmin = useSelector(selectHasRole(ROLES.ADMIN));
  
  // Check any role
  const canManage = useSelector(selectHasAnyRole(['admin', 'operator']));
  
  // Check all permissions
  const hasFullAccess = useSelector(
    selectHasAllPermissions(['device:read', 'device:write'])
  );
  
  return (
    <>
      {canWrite && <EditButton />}
      {isAdmin && <AdminPanel />}
    </>
  );
}
```

## 5. Using Utility Functions

```jsx
import { hasPermission, hasAnyRole, PERMISSIONS, ROLES } from './utils/permissions';

function processAction(user) {
  // Check permission
  if (hasPermission(user.permissions, PERMISSIONS.DEVICE_WRITE)) {
    performWrite();
  }
  
  // Check any role
  if (hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.OPERATOR])) {
    performAction();
  }
}
```

## 6. Predefined Constants

```jsx
import { PERMISSIONS, ROLES } from './utils/permissions';

// Permissions
PERMISSIONS.DEVICE_READ        // 'device:read'
PERMISSIONS.DEVICE_WRITE       // 'device:write'
PERMISSIONS.DEVICE_DELETE      // 'device:delete'
PERMISSIONS.DEVICE_CONFIGURE   // 'device:configure'
PERMISSIONS.QUERY_READ         // 'query:read'
PERMISSIONS.QUERY_WRITE        // 'query:write'
PERMISSIONS.QUERY_DELETE       // 'query:delete'
PERMISSIONS.MIB_UPLOAD         // 'mib:upload'
PERMISSIONS.MIB_DELETE         // 'mib:delete'
PERMISSIONS.USER_READ          // 'user:read'
PERMISSIONS.USER_WRITE         // 'user:write'
PERMISSIONS.USER_DELETE        // 'user:delete'
PERMISSIONS.ADMIN_ACCESS       // 'admin:access'

// Roles
ROLES.ADMIN      // 'admin'
ROLES.USER       // 'user'
ROLES.OPERATOR   // 'operator'
ROLES.VIEWER     // 'viewer'
```

## 7. Fetch Fresh RBAC Data

```jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectIsAuthenticated } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);
  
  return <Router>...</Router>;
}
```

## 8. Pattern: Gate Multiple Actions

```jsx
function DeviceActions({ device }) {
  const canWrite = useSelector(selectHasPermission(PERMISSIONS.DEVICE_WRITE));
  const canDelete = useSelector(selectHasPermission(PERMISSIONS.DEVICE_DELETE));
  
  return (
    <Box>
      {canWrite && (
        <IconButton onClick={() => handleEdit(device)}>
          <EditIcon />
        </IconButton>
      )}
      {canDelete && (
        <IconButton onClick={() => handleDelete(device)}>
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
}
```

## 9. Pattern: Disabled with Feedback

```jsx
<WithPermission 
  requiredPermissions={[PERMISSIONS.DEVICE_WRITE]}
  fallback={
    <Tooltip title="You don't have permission to add devices">
      <span>
        <Button variant="contained" startIcon={<AddIcon />} disabled>
          Add Device
        </Button>
      </span>
    </Tooltip>
  }
>
  <Button 
    variant="contained" 
    startIcon={<AddIcon />} 
    onClick={handleAdd}
  >
    Add Device
  </Button>
</WithPermission>
```

## 10. Backend Expected Format

```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user", "operator"],
    "permissions": ["device:read", "device:write"],
    "currentTenant": "tenant-abc"
  },
  "token": "jwt-token-here"
}
```

## Common Patterns Summary

| Task | Best Approach |
|------|--------------|
| Protect entire route | `ProtectedRoute` wrapper |
| Hide/show UI element | `WithPermission` component |
| Wrap reusable component | `withPermission` HOC |
| Conditional logic in code | `useSelector` with selectors |
| Pure function check | Utility functions |
| Get user RBAC data | `dispatch(fetchCurrentUser())` |

## Tips

✅ **DO:**
- Use predefined constants (PERMISSIONS, ROLES)
- Provide fallback UI for better UX
- Always validate on backend too
- Fetch fresh data after login

❌ **DON'T:**
- Hardcode permission strings
- Rely solely on frontend checks
- Forget backward compatibility
- Over-gate every button

---

For complete documentation, see `RBAC_GUIDE.md`
