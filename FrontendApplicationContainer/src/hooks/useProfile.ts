import { useQuery } from '@tanstack/react-query';
import http from '../api/httpClient';
import type { UserInfo } from '../store/slices/authSlice';

// PUBLIC_INTERFACE
export function useProfile() {
  /**
   * Fetches the current user's profile from a placeholder endpoint.
   * Replace '/users/me' with the backend endpoint once available.
   */
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<UserInfo> => {
      // Placeholder: if backend not ready, return demo user
      try {
        const { data } = await http.get('/users/me');
        return data as UserInfo;
      } catch {
        // Fallback for now; this allows the UI to render while backend is stubbed
        return {
          id: '1',
          email: 'demo@acme.io',
          name: 'Demo User',
          roles: ['user'],
        };
      }
    },
    staleTime: 60_000,
  });
}
