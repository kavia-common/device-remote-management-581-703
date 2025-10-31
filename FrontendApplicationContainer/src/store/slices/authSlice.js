import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';

// Async thunks

// PUBLIC_INTERFACE
/**
 * Login user async thunk
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Register user async thunk
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Logout user async thunk
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Logout failed' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Fetch current user data including roles and permissions from /auth/me endpoint
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.user || response));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user data' });
    }
  }
);

// Initial state
const initialState = (() => {
  const storedUser = JSON.parse(localStorage.getItem('user')) || null;
  return {
    user: storedUser,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    // RBAC fields with backward compatibility
    roles: storedUser?.roles || [],
    permissions: storedUser?.permissions || [],
    currentTenant: storedUser?.currentTenant || null,
  };
})();

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Update RBAC fields from user data
      state.roles = action.payload?.roles || [];
      state.permissions = action.payload?.permissions || [];
      state.currentTenant = action.payload?.currentTenant || null;
    },
    // PUBLIC_INTERFACE
    /**
     * Update roles in the auth state
     */
    setRoles: (state, action) => {
      state.roles = action.payload || [];
      if (state.user) {
        state.user.roles = action.payload || [];
      }
    },
    // PUBLIC_INTERFACE
    /**
     * Update permissions in the auth state
     */
    setPermissions: (state, action) => {
      state.permissions = action.payload || [];
      if (state.user) {
        state.user.permissions = action.payload || [];
      }
    },
    // PUBLIC_INTERFACE
    /**
     * Update current tenant in the auth state
     */
    setCurrentTenant: (state, action) => {
      state.currentTenant = action.payload;
      if (state.user) {
        state.user.currentTenant = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        // Extract RBAC fields with backward compatibility
        state.roles = action.payload.user?.roles || [];
        state.permissions = action.payload.user?.permissions || [];
        state.currentTenant = action.payload.user?.currentTenant || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.roles = [];
        state.permissions = [];
        state.currentTenant = null;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.user || action.payload;
        state.user = userData;
        state.roles = userData?.roles || [];
        state.permissions = userData?.permissions || [];
        state.currentTenant = userData?.currentTenant || null;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user data';
      });
  },
});

// Selectors

// PUBLIC_INTERFACE
/**
 * Select the current user
 */
export const selectUser = (state) => state.auth.user;

// PUBLIC_INTERFACE
/**
 * Select authentication status
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// PUBLIC_INTERFACE
/**
 * Select user roles
 */
export const selectRoles = (state) => state.auth.roles || [];

// PUBLIC_INTERFACE
/**
 * Select user permissions
 */
export const selectPermissions = (state) => state.auth.permissions || [];

// PUBLIC_INTERFACE
/**
 * Select current tenant
 */
export const selectCurrentTenant = (state) => state.auth.currentTenant;

// PUBLIC_INTERFACE
/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {Function} Selector function
 */
export const selectHasRole = (role) => (state) => {
  const roles = state.auth.roles || [];
  return roles.includes(role);
};

// PUBLIC_INTERFACE
/**
 * Check if user has any of the specified roles
 * @param {string[]} requiredRoles - Array of roles to check
 * @returns {Function} Selector function
 */
export const selectHasAnyRole = (requiredRoles = []) => (state) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const roles = state.auth.roles || [];
  return requiredRoles.some(role => roles.includes(role));
};

// PUBLIC_INTERFACE
/**
 * Check if user has all of the specified roles
 * @param {string[]} requiredRoles - Array of roles to check
 * @returns {Function} Selector function
 */
export const selectHasAllRoles = (requiredRoles = []) => (state) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const roles = state.auth.roles || [];
  return requiredRoles.every(role => roles.includes(role));
};

// PUBLIC_INTERFACE
/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Selector function
 */
export const selectHasPermission = (permission) => (state) => {
  const permissions = state.auth.permissions || [];
  return permissions.includes(permission);
};

// PUBLIC_INTERFACE
/**
 * Check if user has any of the specified permissions
 * @param {string[]} requiredPermissions - Array of permissions to check
 * @returns {Function} Selector function
 */
export const selectHasAnyPermission = (requiredPermissions = []) => (state) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  const permissions = state.auth.permissions || [];
  return requiredPermissions.some(permission => permissions.includes(permission));
};

// PUBLIC_INTERFACE
/**
 * Check if user has all of the specified permissions
 * @param {string[]} requiredPermissions - Array of permissions to check
 * @returns {Function} Selector function
 */
export const selectHasAllPermissions = (requiredPermissions = []) => (state) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  const permissions = state.auth.permissions || [];
  return requiredPermissions.every(permission => permissions.includes(permission));
};

export const { clearError, setUser, setRoles, setPermissions, setCurrentTenant } = authSlice.actions;
export default authSlice.reducer;
