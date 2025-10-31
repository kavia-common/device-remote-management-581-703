import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// PUBLIC_INTERFACE
/**
 * StatusAnnouncer component provides an aria-live region for screen readers
 * Announces async job status updates without interrupting user flow
 * Uses polite mode to not interrupt current screen reader announcements
 */
const StatusAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');
  const { activeJobs, completedJobs, failedJobs } = useSelector((state) => state.queries);

  useEffect(() => {
    // Announce when jobs complete
    if (completedJobs && completedJobs.length > 0) {
      const latestJob = completedJobs[completedJobs.length - 1];
      if (latestJob) {
        setAnnouncement(`Query ${latestJob.id || 'job'} completed successfully`);
        // Clear announcement after a delay to allow for new announcements
        setTimeout(() => setAnnouncement(''), 1000);
      }
    }
  }, [completedJobs]);

  useEffect(() => {
    // Announce when jobs fail
    if (failedJobs && failedJobs.length > 0) {
      const latestJob = failedJobs[failedJobs.length - 1];
      if (latestJob) {
        setAnnouncement(`Query ${latestJob.id || 'job'} failed: ${latestJob.error || 'Unknown error'}`);
        setTimeout(() => setAnnouncement(''), 1000);
      }
    }
  }, [failedJobs]);

  useEffect(() => {
    // Announce when jobs are in progress (more sparingly)
    if (activeJobs && activeJobs.length > 0) {
      const runningCount = activeJobs.filter(job => job.status === 'running').length;
      if (runningCount > 0) {
        setAnnouncement(`${runningCount} ${runningCount === 1 ? 'query' : 'queries'} in progress`);
        setTimeout(() => setAnnouncement(''), 1000);
      }
    }
  }, [activeJobs]);

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-atomic="true"
      sx={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {announcement}
    </Box>
  );
};

export default StatusAnnouncer;
