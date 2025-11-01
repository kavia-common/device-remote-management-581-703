import { useQuery } from '@tanstack/react-query';
import http from '../api/httpClient';

type UseJobsOptions = {
  jobId?: string | null;
  refetchIntervalMs?: number;
};

// PUBLIC_INTERFACE
export function useJobs(options: UseJobsOptions = {}) {
  /**
   * Jobs polling hook.
   * - If jobId is provided, polls that job at /jobs/{id}
   * - Otherwise, polls the list at /jobs
   * Currently, falls back to '/health' as placeholder if jobs endpoints are not available.
   */
  const { jobId, refetchIntervalMs = 10000 } = options;

  const query = useQuery({
    queryKey: jobId ? ['jobs', 'detail', jobId] : ['jobs', 'list'],
    queryFn: async () => {
      try {
        if (jobId) {
          const { data } = await http.get(`/jobs/${jobId}`);
          return data;
        }
        const { data } = await http.get('/jobs');
        return data ?? [];
      } catch {
        // Fallback placeholder
        const { data } = await http.get('/health');
        return data ?? (jobId ? {} : []);
      }
    },
    refetchInterval: refetchIntervalMs,
  });

  return query;
}
