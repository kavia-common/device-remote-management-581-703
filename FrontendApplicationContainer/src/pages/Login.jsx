import React from 'react';
import { Paper, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../store/authSlice';
import { showSnackbar } from '../store/uiSlice';
import { useNavigate, Navigate } from 'react-router-dom';
import { isMockMode } from '../api/client';

// PUBLIC_INTERFACE
function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthed = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (isAuthed) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || /\S+@\S+\.\S+/.test(email) === false) {
      dispatch(showSnackbar({ message: 'Please enter a valid email.', severity: 'warning' }));
      return;
    }
    if (!password) {
      dispatch(showSnackbar({ message: 'Please enter your password.', severity: 'warning' }));
      return;
    }
    const res = await dispatch(loginThunk({ email, password }));
    if (res.type.endsWith('fulfilled')) {
      dispatch(showSnackbar({ message: isMockMode() ? 'Logged in (mock).' : 'Logged in.', severity: 'success' }));
      navigate('/', { replace: true });
    } else {
      const msg = res.payload?.message || 'Login failed';
      dispatch(showSnackbar({ message: msg, severity: 'error' }));
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{String(error)}</Alert>}
        <form onSubmit={onSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" color="text.secondary" mt={2}>
          {isMockMode()
            ? 'Mock mode is active for endpoints except login when API base is unset.'
            : 'You are signing in against the configured backend.'}
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage;
