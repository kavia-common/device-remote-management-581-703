import { useQuery } from '@tanstack/react-query';
import http from '../api/httpClient';

// PUBLIC_INTERFACE
export function useJobs() {
  /**
   * Placeholder hook for jobs polling.
   * Replace endpoint with your backend jobs API and configure refetchInterval as needed.
   */
  const query = useQuery({
    queryKey: ['jobs', 'list'],
    queryFn: async () => {
      // TODO: replace with /jobs endpoint when available
      // const { data } = await http.get('/jobs');
      // return data;
      const { data } = await http.get('/health'); // placeholder
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  return query;
}
