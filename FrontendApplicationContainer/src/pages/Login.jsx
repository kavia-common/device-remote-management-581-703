import React from 'react';
import { Paper, Box, TextField, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, selectIsAuthenticated } from '../store/authSlice';
import { showSnackbar } from '../store/uiSlice';
import { useNavigate, Navigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthed = useSelector(selectIsAuthenticated);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  if (isAuthed) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      dispatch(showSnackbar({ message: 'Please enter a valid email.', severity: 'warning' }));
      return;
    }
    if (!password) {
      dispatch(showSnackbar({ message: 'Please enter your password.', severity: 'warning' }));
      return;
    }
    setSubmitting(true);
    try {
      // Mocked login creating a fake token
      const token = `mock.${btoa(email)}.jwt`;
      dispatch(loginSuccess({ token, user: { email } }));
      dispatch(showSnackbar({ message: 'Logged in (mock).', severity: 'success' }));
      navigate('/', { replace: true });
    } catch (e2) {
      dispatch(showSnackbar({ message: 'Login failed', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
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
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" color="text.secondary" mt={2}>
          This is a mock authentication flow. Replace with real API when backend is ready.
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage;
