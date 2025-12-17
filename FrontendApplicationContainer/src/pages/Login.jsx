import React from 'react';
import { Paper, Box, TextField, Button, Typography, Alert, Container } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../store/authSlice';
import { showSnackbar } from '../store/uiSlice';
import { useNavigate, Navigate } from 'react-router-dom';
import { isMockMode } from '../api/client';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

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
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh">
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1.5,
                mb: 2,
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={600}>Sign In</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}
          <form onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ mt: 3, mb: 2 }} 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <Alert severity="info" sx={{ mt: 2 }}>
            {isMockMode()
              ? 'Mock mode is active. Any email/password will work.'
              : 'Connecting to configured backend.'}
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage;
