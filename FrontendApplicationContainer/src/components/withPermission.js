import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectHasAnyRole,
  selectHasAllRoles,
  selectHasAnyPermission,
  selectHasAllPermissions,
} from '../store/slices/authSlice';

// PUBLIC_INTERFACE
/**
 * Higher-order component that wraps a component and conditionally renders it based on user roles and permissions
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Authorization options
 * @param {string[]} options.requiredRoles - Array of roles (user must have at least one)
 * @param {string[]} options.requiredPermissions - Array of permissions (user must have at least one)
 * @param {boolean} options.requireAllRoles - If true, user must have all specified roles (default: false)
 * @param {boolean} options.requireAllPermissions - If true, user must have all specified permissions (default: false)
 * @param {React.ReactNode} options.fallback - Component to render when unauthorized (default: null)
 * @returns {React.ComponentType} Wrapped component with permission checks
 */
export const withPermission = (Component, options = {}) => {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    requireAllRoles = false,
    requireAllPermissions = false,
    fallback = null,
  } = options;

  return function PermissionWrapper(props) {
    // Check roles if specified
    const hasRoles = useSelector(
      requireAllRoles ? selectHasAllRoles(requiredRoles) : selectHasAnyRole(requiredRoles)
    );

    // Check permissions if specified
    const hasPermissions = useSelector(
      requireAllPermissions
        ? selectHasAllPermissions(requiredPermissions)
        : selectHasAnyPermission(requiredPermissions)
    );

    // Determine if user is authorized
    const isAuthorized =
      (requiredRoles.length === 0 || hasRoles) &&
      (requiredPermissions.length === 0 || hasPermissions);

    if (!isAuthorized) {
      return fallback;
    }

    return <Component {...props} />;
  };
};

// PUBLIC_INTERFACE
/**
 * React component for conditionally rendering children based on user roles and permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.requiredRoles - Array of roles (user must have at least one)
 * @param {string[]} props.requiredPermissions - Array of permissions (user must have at least one)
 * @param {boolean} props.requireAllRoles - If true, user must have all specified roles (default: false)
 * @param {boolean} props.requireAllPermissions - If true, user must have all specified permissions (default: false)
 * @param {React.ReactNode} props.fallback - Component to render when unauthorized (default: null)
 * @returns {React.ReactNode} Children if authorized, fallback otherwise
 */
export const WithPermission = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = false,
  fallback = null,
}) => {
  // Check roles if specified
  const hasRoles = useSelector(
    requireAllRoles ? selectHasAllRoles(requiredRoles) : selectHasAnyRole(requiredRoles)
  );

  // Check permissions if specified
  const hasPermissions = useSelector(
    requireAllPermissions
      ? selectHasAllPermissions(requiredPermissions)
      : selectHasAnyPermission(requiredPermissions)
  );

  // Determine if user is authorized
  const isAuthorized =
    (requiredRoles.length === 0 || hasRoles) &&
    (requiredPermissions.length === 0 || hasPermissions);

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default WithPermission;
