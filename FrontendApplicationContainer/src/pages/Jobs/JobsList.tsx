import React from 'react';
import { useJobs } from '../../hooks/useJobs';

const JobsList: React.FC = () => {
  const { data, isLoading, error } = useJobs();

  return (
    <section>
      <h1 className="title">Jobs</h1>
      {isLoading && <p>Loading jobs...</p>}
      {error && <p style={{ color: 'crimson' }}>Failed to load jobs</p>}
      {!isLoading && !error && (
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
};

export default JobsList;
