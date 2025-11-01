import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Location } from 'react-router-dom';

type LocationState = { from?: Location };

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = (state?.from as unknown as { pathname?: string })?.pathname || '/dashboard';

  const [email, setEmail] = useState('demo@acme.io');
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="App-header">
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, minWidth: 300 }}>
        <h1 className="title">Device Management Login</h1>
        <label>
          <div className="subtitle">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
          />
        </label>
        <label>
          <div className="subtitle">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', width: '100%' }}
          />
        </label>
        {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
        <button className="theme-toggle" disabled={submitting} type="submit">
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
