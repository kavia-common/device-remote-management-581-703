import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../components/ProtectedRoute';
import authReducer from '../../store/slices/authSlice';

// Test components
const ProtectedContent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized Access</div>;
const CustomFallback = () => <div>Custom Fallback</div>;

// Helper to create a mock store with custom auth state
const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        roles: [],
        permissions: [],
        currentTenant: null,
        ...authState,
      },
    },
  });
};

// Helper to render component with router and store
const renderWithRouterAndStore = (component, store, initialRoute = '/protected') => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute Integration Tests', () => {
  describe('Authentication Check', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const store = createMockStore({
        isAuthenticated: false,
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render protected content when user is authenticated', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User' },
        token: 'test-token',
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', async () => {
      const store = createMockStore({
        isAuthenticated: false,
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/custom-login" element={<div>Custom Login</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute redirectTo="/custom-login">
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Login')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access when user has required role (any role)', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', roles: ['admin', 'viewer'] },
        roles: ['admin', 'viewer'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRoles={['admin', 'moderator']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required role', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', roles: ['viewer'] },
        roles: ['viewer'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should require all roles when requireAllRoles is true', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', roles: ['admin'] },
        roles: ['admin'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin', 'moderator']}
                requireAllRoles={true}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('should allow access when user has all required roles', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', roles: ['admin', 'moderator', 'viewer'] },
        roles: ['admin', 'moderator', 'viewer'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin', 'moderator']}
                requireAllRoles={true}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Permission-Based Access Control', () => {
    it('should allow access when user has required permission (any permission)', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          permissions: ['devices:read', 'devices:write'] 
        },
        permissions: ['devices:read', 'devices:write'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermissions={['devices:read', 'queries:read']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required permission', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          permissions: ['devices:read'] 
        },
        permissions: ['devices:read'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermissions={['admin:write']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('should require all permissions when requireAllPermissions is true', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          permissions: ['devices:read'] 
        },
        permissions: ['devices:read'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredPermissions={['devices:read', 'devices:write']}
                requireAllPermissions={true}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('should allow access when user has all required permissions', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          permissions: ['devices:read', 'devices:write', 'queries:read'] 
        },
        permissions: ['devices:read', 'devices:write', 'queries:read'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredPermissions={['devices:read', 'devices:write']}
                requireAllPermissions={true}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Combined Role and Permission Checks', () => {
    it('should require both role and permission when both are specified', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          roles: ['viewer'],
          permissions: ['devices:read'] 
        },
        roles: ['viewer'],
        permissions: ['devices:read'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin']}
                requiredPermissions={['devices:write']}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('should allow access when user has both required role and permission', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          roles: ['admin'],
          permissions: ['devices:write'] 
        },
        roles: ['admin'],
        permissions: ['devices:write'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin']}
                requiredPermissions={['devices:write']}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback instead of redirecting when provided', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          roles: ['viewer'],
        },
        roles: ['viewer'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin']}
                fallback={<CustomFallback />}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Unauthorized Access')).not.toBeInTheDocument();
    });

    it('should not use fallback when user is authenticated and authorized', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { 
          id: 'user1', 
          name: 'Test User', 
          roles: ['admin'],
        },
        roles: ['admin'],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute 
                requiredRoles={['admin']}
                fallback={<CustomFallback />}
              >
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Custom Fallback')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should allow access when no roles or permissions are required', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User' },
      });

      renderWithRouterAndStore(
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle empty roles array', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', roles: [] },
        roles: [],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRoles={[]}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle empty permissions array', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: { id: 'user1', name: 'Test User', permissions: [] },
        permissions: [],
      });

      renderWithRouterAndStore(
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermissions={[]}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>,
        store
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
