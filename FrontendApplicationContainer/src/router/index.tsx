import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import DevicesList from '../pages/Devices/List';
import SNMP from '../pages/Protocols/SNMP';
import WebPA from '../pages/Protocols/WebPA';
import TR69 from '../pages/Protocols/TR69';
import TR369 from '../pages/Protocols/TR369';
import JobsList from '../pages/Jobs/JobsList';
import Profile from '../pages/Settings/Profile';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// PUBLIC_INTERFACE
export function AppRouter(): JSX.Element {
  /**
   * Defines all application routes. Public routes are accessible without auth,
   * protected routes require authenticated state via ProtectedRoute.
   */
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
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
            <DevicesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/protocols/snmp"
        element={
          <ProtectedRoute>
            <SNMP />
          </ProtectedRoute>
        }
      />
      <Route
        path="/protocols/webpa"
        element={
          <ProtectedRoute>
            <WebPA />
          </ProtectedRoute>
        }
      />
      <Route
        path="/protocols/tr69"
        element={
          <ProtectedRoute>
            <TR69 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/protocols/tr369"
        element={
          <ProtectedRoute>
            <TR369 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
export { AppRouter };
