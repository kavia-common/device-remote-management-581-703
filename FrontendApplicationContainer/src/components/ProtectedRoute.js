import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectRoles,
  selectPermissions,
} from '../store/slices/authSlice';
import { hasAnyRole, hasAllRoles, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

// PUBLIC_INTERFACE
/**
 * Protected route component that redirects to login if user is not authenticated
 * and checks for required roles and permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated and authorized
 * @param {string[]} props.requiredRoles - Array of roles (user must have at least one)
 * @param {string[]} props.requiredPermissions - Array of permissions (user must have at least one)
 * @param {boolean} props.requireAllRoles - If true, user must have all specified roles (default: false)
 * @param {boolean} props.requireAllPermissions - If true, user must have all specified permissions (default: false)
 * @param {React.ReactNode} props.fallback - Component to render when unauthorized (default: redirect to login)
 * @param {string} props.redirectTo - Path to redirect when unauthorized (default: '/login')
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = false,
  fallback = null,
  redirectTo = '/login',
}) => {
  // Always call hooks unconditionally
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRoles = useSelector(selectRoles);
  const userPermissions = useSelector(selectPermissions);
  
  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const roleCheck = requireAllRoles 
      ? hasAllRoles(userRoles, requiredRoles)
      : hasAnyRole(userRoles, requiredRoles);
    
    if (!roleCheck) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const permissionCheck = requireAllPermissions
      ? hasAllPermissions(userPermissions, requiredPermissions)
      : hasAnyPermission(userPermissions, requiredPermissions);
    
    if (!permissionCheck) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
