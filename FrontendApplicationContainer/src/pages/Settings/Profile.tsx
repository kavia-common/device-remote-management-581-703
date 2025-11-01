import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const Profile: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <section>
      <h1 className="title">Profile</h1>
      {user ? (
        <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {user.roles?.join(', ') || 'user'}</p>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </section>
  );
};

export default Profile;
