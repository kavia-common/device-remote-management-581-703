import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { loginSuccess, logout } from '../store/slices/authSlice';
import http from '../api/httpClient';

// PUBLIC_INTERFACE
export function useAuth() {
  /**
   * Hook exposing authentication helpers and state.
   * Stubs login request; replace with actual API call when backend is ready.
   */
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      // TODO: Replace with real login call:
      // const { data } = await http.post('/auth/login', { email, password });
      // dispatch(loginSuccess({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }));
      await new Promise((r) => setTimeout(r, 400));
      dispatch(
        loginSuccess({
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
          user: { id: '1', email, name: 'Demo User', roles: ['user'] },
        })
      );
      return true;
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      // Optionally call logout endpoint
      // await http.post('/auth/logout');
    } finally {
      dispatch(logout());
    }
  }, [dispatch]);

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    accessToken: auth.accessToken,
    login,
    logout: signOut,
  };
}
