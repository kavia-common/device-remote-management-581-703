import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../ProtectedRoute';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (isAuthenticated) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: isAuthenticated ? { id: '1', email: 'test@test.com' } : null,
        token: isAuthenticated ? 'test-token' : null,
        isAuthenticated,
        loading: false,
        error: null,
      },
    },
  });
};

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    const store = createMockStore(true);

    render(
      <Provider store={store}>
        <BrowserRouter>
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
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    const store = createMockStore(false);

    render(
      <Provider store={store}>
        <BrowserRouter>
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
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
