import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// PUBLIC_INTERFACE
/**
 * Protected route component that redirects to login if user is not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
