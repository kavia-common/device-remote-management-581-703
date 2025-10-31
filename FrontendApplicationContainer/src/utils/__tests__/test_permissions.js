import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  PERMISSIONS,
  ROLES,
} from '../permissions';

describe('permissions utility', () => {
  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const userRoles = ['admin', 'user'];
      expect(hasRole(userRoles, 'admin')).toBe(true);
    });

    it('should return false when user lacks the role', () => {
      const userRoles = ['user'];
      expect(hasRole(userRoles, 'admin')).toBe(false);
    });

    it('should handle empty roles array', () => {
      expect(hasRole([], 'admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any required role', () => {
      const userRoles = ['user'];
      expect(hasAnyRole(userRoles, ['admin', 'user'])).toBe(true);
    });

    it('should return false when user lacks all required roles', () => {
      const userRoles = ['viewer'];
      expect(hasAnyRole(userRoles, ['admin', 'user'])).toBe(false);
    });

    it('should return true when no roles are required', () => {
      const userRoles = ['user'];
      expect(hasAnyRole(userRoles, [])).toBe(true);
    });

    it('should handle empty user roles', () => {
      expect(hasAnyRole([], ['admin'])).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all required roles', () => {
      const userRoles = ['admin', 'user'];
      expect(hasAllRoles(userRoles, ['admin', 'user'])).toBe(true);
    });

    it('should return false when user lacks some required roles', () => {
      const userRoles = ['user'];
      expect(hasAllRoles(userRoles, ['admin', 'user'])).toBe(false);
    });

    it('should return true when no roles are required', () => {
      const userRoles = ['user'];
      expect(hasAllRoles(userRoles, [])).toBe(true);
    });

    it('should handle empty user roles', () => {
      expect(hasAllRoles([], ['admin'])).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      const userPermissions = ['device:write', 'device:read'];
      expect(hasPermission(userPermissions, 'device:write')).toBe(true);
    });

    it('should return false when user lacks the permission', () => {
      const userPermissions = ['device:read'];
      expect(hasPermission(userPermissions, 'device:write')).toBe(false);
    });

    it('should handle empty permissions array', () => {
      expect(hasPermission([], 'device:write')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has any required permission', () => {
      const userPermissions = ['device:read'];
      expect(hasAnyPermission(userPermissions, ['device:write', 'device:read'])).toBe(true);
    });

    it('should return false when user lacks all required permissions', () => {
      const userPermissions = ['query:read'];
      expect(hasAnyPermission(userPermissions, ['device:write', 'device:read'])).toBe(false);
    });

    it('should return true when no permissions are required', () => {
      const userPermissions = ['device:read'];
      expect(hasAnyPermission(userPermissions, [])).toBe(true);
    });

    it('should handle empty user permissions', () => {
      expect(hasAnyPermission([], ['device:write'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const userPermissions = ['device:write', 'device:read'];
      expect(hasAllPermissions(userPermissions, ['device:write', 'device:read'])).toBe(true);
    });

    it('should return false when user lacks some required permissions', () => {
      const userPermissions = ['device:read'];
      expect(hasAllPermissions(userPermissions, ['device:write', 'device:read'])).toBe(false);
    });

    it('should return true when no permissions are required', () => {
      const userPermissions = ['device:read'];
      expect(hasAllPermissions(userPermissions, [])).toBe(true);
    });

    it('should handle empty user permissions', () => {
      expect(hasAllPermissions([], ['device:write'])).toBe(false);
    });
  });

  describe('constants', () => {
    it('should export PERMISSIONS constants', () => {
      expect(PERMISSIONS.DEVICE_READ).toBe('device:read');
      expect(PERMISSIONS.DEVICE_WRITE).toBe('device:write');
      expect(PERMISSIONS.DEVICE_DELETE).toBe('device:delete');
    });

    it('should export ROLES constants', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.USER).toBe('user');
      expect(ROLES.OPERATOR).toBe('operator');
      expect(ROLES.VIEWER).toBe('viewer');
    });
  });
});
