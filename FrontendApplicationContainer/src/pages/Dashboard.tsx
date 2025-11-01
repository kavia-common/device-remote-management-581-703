import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <section>
      <h1 className="title">Dashboard</h1>
      <p className="description">Welcome to the Device Remote Management Platform.</p>
      <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
        <li>Manage devices across multiple protocols.</li>
        <li>Monitor jobs and view execution history.</li>
        <li>Update your profile and preferences.</li>
      </ul>
    </section>
  );
};

export default Dashboard;
