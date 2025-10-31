import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { withPermission, WithPermission } from '../withPermission';
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

const TestComponent = ({ message = 'Protected Content' }) => <div>{message}</div>;
const FallbackComponent = () => <div>Unauthorized</div>;

describe('withPermission HOC', () => {
  it('should render component when user has required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render component when user lacks required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render component when user has any required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin', 'user'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render component when user has all required roles', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin', 'user'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin', 'user'],
      requireAllRoles: true,
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render component when user has required permission', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      permissions: ['device:write'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredPermissions: ['device:write'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render component when user lacks required permission', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      permissions: ['device:read'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredPermissions: ['device:write'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render fallback when unauthorized', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin'],
      fallback: <FallbackComponent />,
    });

    render(
      <Provider store={store}>
        <ProtectedComponent />
      </Provider>
    );

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin'],
    });

    const ProtectedComponent = withPermission(TestComponent, {
      requiredRoles: ['admin'],
    });

    render(
      <Provider store={store}>
        <ProtectedComponent message="Custom Message" />
      </Provider>
    );

    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });
});

describe('WithPermission component', () => {
  it('should render children when user has required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['admin'],
    });

    render(
      <Provider store={store}>
        <WithPermission requiredRoles={['admin']}>
          <div>Protected Content</div>
        </WithPermission>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks required role', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <WithPermission requiredRoles={['admin']}>
          <div>Protected Content</div>
        </WithPermission>
      </Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has required permission', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      permissions: ['device:write'],
    });

    render(
      <Provider store={store}>
        <WithPermission requiredPermissions={['device:write']}>
          <div>Protected Content</div>
        </WithPermission>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback when unauthorized', () => {
    const store = createMockStore({
      user: { id: '1', email: 'test@test.com' },
      token: 'test-token',
      isAuthenticated: true,
      roles: ['user'],
    });

    render(
      <Provider store={store}>
        <WithPermission requiredRoles={['admin']} fallback={<div>Unauthorized</div>}>
          <div>Protected Content</div>
        </WithPermission>
      </Provider>
    );

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
