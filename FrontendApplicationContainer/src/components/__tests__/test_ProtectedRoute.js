import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../ProtectedRoute';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: authState.user || null,
        token: authState.token || null,
        isAuthenticated: authState.isAuthenticated || false,
        loading: false,
        error: null,
        roles: authState.roles || [],
        permissions: authState.permissions || [],
        currentTenant: authState.currentTenant || null,
      },
    },
  });
};

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const UnauthorizedComponent = () => <div>Unauthorized Access</div>;
const FallbackComponent = () => <div>Custom Fallback</div>;

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const store = createMockStore({
      isAuthenticated: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin', 'user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to unauthorized when user lacks required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has any of required roles', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin', 'user']}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when user has all required roles', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin', 'user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin', 'user']} requireAllRoles={true}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user lacks all required roles', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operator']} requireAllRoles={true}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
  });

  it('should render children when user has required permission', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      permissions: ['device:write', 'device:read'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermissions={['device:write']}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user lacks required permission', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      permissions: ['device:read'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermissions={['device:write']}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
  });

  it('should render fallback component when unauthorized', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={['admin']} fallback={<FallbackComponent />}>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should work with backward compatibility (no RBAC fields)', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
