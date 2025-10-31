import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// App shell providers
import AppErrorBoundary from './components/AppErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { RealtimeProvider } from './components/RealtimeProvider';

// Lazy-loaded route components for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Devices = lazy(() => import('./pages/Devices'));
const SNMPPage = lazy(() => import('./pages/protocols/SNMPPage'));
const WebPAPage = lazy(() => import('./pages/protocols/WebPAPage'));
const TR69Page = lazy(() => import('./pages/protocols/TR69Page'));
const TR369Page = lazy(() => import('./pages/protocols/TR369Page'));
const QueryHistory = lazy(() => import('./pages/QueryHistory'));
const MIBUpload = lazy(() => import('./pages/MIBUpload'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Help = lazy(() => import('./pages/Help'));

// Create React Query client
// PUBLIC_INTERFACE
/**
 * Global React Query client instance
 * Exported for use in components that need direct access to query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// PUBLIC_INTERFACE
/**
 * Minimal skeleton/fallback component displayed while route components are loading
 * Provides visual feedback during lazy loading
 */
function FallbackSkeleton() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ height: 16, width: 160, background: '#e5e7eb', borderRadius: 8, marginBottom: 12 }} />
      <div style={{ height: 12, width: '60%', background: '#e5e7eb', borderRadius: 8, marginBottom: 8 }} />
      <div style={{ height: 12, width: '40%', background: '#e5e7eb', borderRadius: 8, marginBottom: 8 }} />
      <div style={{ height: 200, width: '100%', background: '#f3f4f6', borderRadius: 8 }} />
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Main App component
 * Configures routing, Redux store, React Query, and Material-UI theme
 * Now wrapped with AppErrorBoundary, ToastProvider, RealtimeProvider, and React.Suspense
 * All major routes are lazy-loaded for optimal bundle size and performance
 */
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppErrorBoundary>
            <ToastProvider>
              <RealtimeProvider>
                <Router>
                  <Layout>
                    <Suspense fallback={<FallbackSkeleton />}>
                      <Routes>
                        {/* Public routes - lazy loaded */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected routes - lazy loaded */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/devices"
                          element={
                            <ProtectedRoute>
                              <Devices />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/protocols/snmp"
                          element={
                            <ProtectedRoute>
                              <SNMPPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/protocols/webpa"
                          element={
                            <ProtectedRoute>
                              <WebPAPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/protocols/tr69"
                          element={
                            <ProtectedRoute>
                              <TR69Page />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/protocols/tr369"
                          element={
                            <ProtectedRoute>
                              <TR369Page />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/history"
                          element={
                            <ProtectedRoute>
                              <QueryHistory />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/config/mib"
                          element={
                            <ProtectedRoute>
                              <MIBUpload />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/help"
                          element={
                            <ProtectedRoute>
                              <Help />
                            </ProtectedRoute>
                          }
                        />

                        {/* Redirect root to dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </Router>
              </RealtimeProvider>
            </ToastProvider>
          </AppErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
