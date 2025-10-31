import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import SNMPPage from './pages/protocols/SNMPPage';
import WebPAPage from './pages/protocols/WebPAPage';
import TR69Page from './pages/protocols/TR69Page';
import TR369Page from './pages/protocols/TR369Page';
import QueryHistory from './pages/QueryHistory';
import MIBUpload from './pages/MIBUpload';

// Create React Query client
const queryClient = new QueryClient({
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
 * Main App component
 * Configures routing, Redux store, React Query, and Material-UI theme
 */
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/devices"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Devices />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/protocols/snmp"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SNMPPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/protocols/webpa"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <WebPAPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/protocols/tr69"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TR69Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/protocols/tr369"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TR369Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QueryHistory />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/config/mib"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MIBUpload />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
