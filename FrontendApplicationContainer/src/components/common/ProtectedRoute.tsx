import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export interface ProtectedRouteProps {
  children: React.ReactElement;
}

// PUBLIC_INTERFACE
export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  /**
   * Protects a route by redirecting to /login if user is not authenticated.
   */
  const location = useLocation();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
