import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useProfile } from '../../hooks/useProfile';
import { setUser } from '../../store/slices/authSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const userFromState = useSelector((s: RootState) => s.auth.user);
  const { data: me, isLoading, error } = useProfile();

  useEffect(() => {
    if (me && (!userFromState || userFromState?.id !== me.id)) {
      dispatch(setUser(me));
    }
  }, [me, userFromState, dispatch]);

  return (
    <section>
      <h1 className="title">Profile</h1>
      {isLoading && <p>Loading profile...</p>}
      {error && <p style={{ color: 'crimson' }}>Failed to load profile</p>}
      {!isLoading && (me || userFromState) ? (
        <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
          <p><strong>Name:</strong> {me?.name ?? userFromState?.name ?? 'N/A'}</p>
          <p><strong>Email:</strong> {me?.email ?? userFromState?.email ?? 'N/A'}</p>
          <p><strong>Roles:</strong> {(me?.roles ?? userFromState?.roles ?? ['user']).join(', ')}</p>
        </div>
      ) : null}
      {!isLoading && !me && !userFromState ? <p>No user data available.</p> : null}
    </section>
  );
};

export default Profile;
