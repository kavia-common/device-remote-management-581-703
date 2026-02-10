import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../services/api';
import { setCredentials, logout } from '../../store/slices/authSlice';

// PUBLIC_INTERFACE
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Verify token and get current user
          const response = await authApi.getCurrentUser();
          dispatch(setCredentials({
            user: response.data,
            token: token,
          }));
        } catch (error) {
          // Token is invalid, logout
          dispatch(logout());
        }
      }
    };

    initializeAuth();
  }, [token, dispatch]);

  return children;
};

export default AuthProvider;
