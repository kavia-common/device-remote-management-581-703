// PUBLIC_INTERFACE
/**
 * Check if user has a specific role
 * @param {string[]} userRoles - User's roles array
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (userRoles = [], role) => {
  return userRoles.includes(role);
};

// PUBLIC_INTERFACE
/**
 * Check if user has any of the specified roles
 * @param {string[]} userRoles - User's roles array
 * @param {string[]} requiredRoles - Array of roles to check
 * @returns {boolean} True if user has at least one role
 */
export const hasAnyRole = (userRoles = [], requiredRoles = []) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some(role => userRoles.includes(role));
};

// PUBLIC_INTERFACE
/**
 * Check if user has all of the specified roles
 * @param {string[]} userRoles - User's roles array
 * @param {string[]} requiredRoles - Array of roles to check
 * @returns {boolean} True if user has all roles
 */
export const hasAllRoles = (userRoles = [], requiredRoles = []) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.every(role => userRoles.includes(role));
};

// PUBLIC_INTERFACE
/**
 * Check if user has a specific permission
 * @param {string[]} userPermissions - User's permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (userPermissions = [], permission) => {
  return userPermissions.includes(permission);
};

// PUBLIC_INTERFACE
/**
 * Check if user has any of the specified permissions
 * @param {string[]} userPermissions - User's permissions array
 * @param {string[]} requiredPermissions - Array of permissions to check
 * @returns {boolean} True if user has at least one permission
 */
export const hasAnyPermission = (userPermissions = [], requiredPermissions = []) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// PUBLIC_INTERFACE
/**
 * Check if user has all of the specified permissions
 * @param {string[]} userPermissions - User's permissions array
 * @param {string[]} requiredPermissions - Array of permissions to check
 * @returns {boolean} True if user has all permissions
 */
export const hasAllPermissions = (userPermissions = [], requiredPermissions = []) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Common permission constants
export const PERMISSIONS = {
  // Device permissions
  DEVICE_READ: 'device:read',
  DEVICE_WRITE: 'device:write',
  DEVICE_DELETE: 'device:delete',
  DEVICE_CONFIGURE: 'device:configure',
  
  // Query permissions
  QUERY_READ: 'query:read',
  QUERY_WRITE: 'query:write',
  QUERY_DELETE: 'query:delete',
  
  // Query favorites permissions
  QUERY_FAVORITES_READ: 'queries:favorites:read',
  QUERY_FAVORITES_WRITE: 'queries:favorites:write',
  
  // MIB permissions
  MIB_UPLOAD: 'mib:upload',
  MIB_DELETE: 'mib:delete',
  
  // User permissions
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
};

// Common role constants
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};
