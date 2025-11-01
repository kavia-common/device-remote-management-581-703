import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

// PUBLIC_INTERFACE
export function Nav(): JSX.Element {
  /**
   * Top navigation bar for the application.
   */
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx('App-link', { active: isActive });

  return (
    <nav className="navbar" style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid var(--border-color)' }}>
      <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
      <NavLink to="/devices" className={linkClass}>Devices</NavLink>
      <NavLink to="/protocols/snmp" className={linkClass}>SNMP</NavLink>
      <NavLink to="/protocols/webpa" className={linkClass}>WebPA</NavLink>
      <NavLink to="/protocols/tr69" className={linkClass}>TR69</NavLink>
      <NavLink to="/protocols/tr369" className={linkClass}>TR369</NavLink>
      <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
      <NavLink to="/settings/profile" className={linkClass}>Profile</NavLink>
      <button className="theme-toggle" onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
    </nav>
  );
}

export default Nav;
