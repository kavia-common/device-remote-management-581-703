import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  clearError,
  setUser,
  setRoles,
  setPermissions,
  setCurrentTenant,
  selectUser,
  selectIsAuthenticated,
  selectRoles,
  selectPermissions,
  selectCurrentTenant,
  selectHasRole,
  selectHasAnyRole,
  selectHasAllRoles,
  selectHasPermission,
  selectHasAnyPermission,
  selectHasAllPermissions,
} from '../authSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
      expect(state.currentTenant).toBeNull();
    });

    it('should load user from localStorage', () => {
      const user = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'test-token');

      // Re-import to get fresh initial state
      jest.resetModules();
      const authReducer = require('../authSlice').default;

      const state = authReducer(undefined, { type: '@@INIT' });

      expect(state.isAuthenticated).toBe(true);
    });

    it('should load RBAC data from localStorage user', () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        roles: ['admin', 'user'],
        permissions: ['device:write', 'device:read'],
        currentTenant: 'tenant-1',
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'test-token');

      jest.resetModules();
      const authReducer = require('../authSlice').default;

      const state = authReducer(undefined, { type: '@@INIT' });

      expect(state.roles).toEqual(['admin', 'user']);
      expect(state.permissions).toEqual(['device:write', 'device:read']);
      expect(state.currentTenant).toBe('tenant-1');
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Some error',
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle setUser', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const user = {
        id: '1',
        email: 'test@test.com',
        roles: ['user'],
        permissions: ['device:read'],
        currentTenant: 'tenant-1',
      };
      const state = authReducer(initialState, setUser(user));

      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.roles).toEqual(['user']);
      expect(state.permissions).toEqual(['device:read']);
      expect(state.currentTenant).toBe('tenant-1');
    });

    it('should handle setRoles', () => {
      const initialState = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, setRoles(['admin', 'user']));

      expect(state.roles).toEqual(['admin', 'user']);
      expect(state.user.roles).toEqual(['admin', 'user']);
    });

    it('should handle setPermissions', () => {
      const initialState = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, setPermissions(['device:write', 'device:read']));

      expect(state.permissions).toEqual(['device:write', 'device:read']);
      expect(state.user.permissions).toEqual(['device:write', 'device:read']);
    });

    it('should handle setCurrentTenant', () => {
      const initialState = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, setCurrentTenant('tenant-1'));

      expect(state.currentTenant).toBe('tenant-1');
      expect(state.user.currentTenant).toBe('tenant-1');
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle loginUser.pending', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Old error',
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: loginUser.pending.type,
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const payload = {
        user: {
          id: '1',
          email: 'test@test.com',
          roles: ['user'],
          permissions: ['device:read'],
          currentTenant: 'tenant-1',
        },
        token: 'test-token',
      };

      const state = authReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload,
      });

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);
      expect(state.error).toBeNull();
      expect(state.roles).toEqual(['user']);
      expect(state.permissions).toEqual(['device:read']);
      expect(state.currentTenant).toBe('tenant-1');
    });

    it('should handle loginUser.fulfilled with backward compatibility (no RBAC fields)', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const payload = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
      };

      const state = authReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload,
      });

      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
      expect(state.currentTenant).toBeNull();
    });

    it('should handle loginUser.rejected', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: loginUser.rejected.type,
        payload: { message: 'Login failed' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('registerUser async thunk', () => {
    it('should handle registerUser.pending', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: registerUser.pending.type,
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle registerUser.fulfilled', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: registerUser.fulfilled.type,
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle registerUser.rejected', () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: registerUser.rejected.type,
        payload: { message: 'Registration failed' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Registration failed');
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle logoutUser.fulfilled', () => {
      const initialState = {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: ['admin'],
        permissions: ['device:write'],
        currentTenant: 'tenant-1',
      };

      const state = authReducer(initialState, {
        type: logoutUser.fulfilled.type,
      });

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
      expect(state.currentTenant).toBeNull();
    });
  });

  describe('fetchCurrentUser async thunk', () => {
    it('should handle fetchCurrentUser.pending', () => {
      const initialState = {
        user: null,
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: fetchCurrentUser.pending.type,
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchCurrentUser.fulfilled', () => {
      const initialState = {
        user: null,
        token: 'test-token',
        isAuthenticated: true,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const payload = {
        user: {
          id: '1',
          email: 'test@test.com',
          roles: ['admin', 'user'],
          permissions: ['device:write', 'device:read'],
          currentTenant: 'tenant-1',
        },
      };

      const state = authReducer(initialState, {
        type: fetchCurrentUser.fulfilled.type,
        payload,
      });

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(payload.user);
      expect(state.roles).toEqual(['admin', 'user']);
      expect(state.permissions).toEqual(['device:write', 'device:read']);
      expect(state.currentTenant).toBe('tenant-1');
      expect(state.error).toBeNull();
    });

    it('should handle fetchCurrentUser.rejected', () => {
      const initialState = {
        user: null,
        token: 'test-token',
        isAuthenticated: true,
        loading: true,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
      };

      const state = authReducer(initialState, {
        type: fetchCurrentUser.rejected.type,
        payload: { message: 'Failed to fetch user data' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch user data');
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: { id: '1', email: 'test@test.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
        roles: ['admin', 'user'],
        permissions: ['device:write', 'device:read', 'query:write'],
        currentTenant: 'tenant-1',
      },
    };

    it('should select user', () => {
      expect(selectUser(mockState)).toEqual(mockState.auth.user);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('should select roles', () => {
      expect(selectRoles(mockState)).toEqual(['admin', 'user']);
    });

    it('should select permissions', () => {
      expect(selectPermissions(mockState)).toEqual(['device:write', 'device:read', 'query:write']);
    });

    it('should select currentTenant', () => {
      expect(selectCurrentTenant(mockState)).toBe('tenant-1');
    });

    it('should check if user has role', () => {
      expect(selectHasRole('admin')(mockState)).toBe(true);
      expect(selectHasRole('viewer')(mockState)).toBe(false);
    });

    it('should check if user has any role', () => {
      expect(selectHasAnyRole(['admin', 'operator'])(mockState)).toBe(true);
      expect(selectHasAnyRole(['viewer', 'operator'])(mockState)).toBe(false);
      expect(selectHasAnyRole([])(mockState)).toBe(true);
    });

    it('should check if user has all roles', () => {
      expect(selectHasAllRoles(['admin', 'user'])(mockState)).toBe(true);
      expect(selectHasAllRoles(['admin', 'operator'])(mockState)).toBe(false);
      expect(selectHasAllRoles([])(mockState)).toBe(true);
    });

    it('should check if user has permission', () => {
      expect(selectHasPermission('device:write')(mockState)).toBe(true);
      expect(selectHasPermission('device:delete')(mockState)).toBe(false);
    });

    it('should check if user has any permission', () => {
      expect(selectHasAnyPermission(['device:write', 'device:delete'])(mockState)).toBe(true);
      expect(selectHasAnyPermission(['device:delete', 'mib:delete'])(mockState)).toBe(false);
      expect(selectHasAnyPermission([])(mockState)).toBe(true);
    });

    it('should check if user has all permissions', () => {
      expect(selectHasAllPermissions(['device:write', 'device:read'])(mockState)).toBe(true);
      expect(selectHasAllPermissions(['device:write', 'device:delete'])(mockState)).toBe(false);
      expect(selectHasAllPermissions([])(mockState)).toBe(true);
    });
  });
});
