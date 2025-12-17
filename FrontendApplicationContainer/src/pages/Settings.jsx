import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Stack } from '@mui/material';
import { apiHealth, currentApiBase } from '../api';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/uiSlice';

// PUBLIC_INTERFACE
function SettingsPage() {
  const dispatch = useDispatch();
  const envValues = {
    REACT_APP_API_BASE: process.env.REACT_APP_API_BASE || '',
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL || '',
    REACT_APP_FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || '',
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL || '',
    REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || '',
    REACT_APP_HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH || '/health',
    REACT_APP_FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || '',
    REACT_APP_EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || '',
    REACT_APP_PORT: process.env.REACT_APP_PORT || '3000',
  };

  const onCheck = async () => {
    try {
      const res = await apiHealth();
      dispatch(showSnackbar({ message: `Health: ${res?.status || 'unknown'}`, severity: 'success' }));
    } catch (e) {
      dispatch(showSnackbar({ message: 'Health check failed', severity: 'error' }));
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Environment</Typography>
        <List dense>
          {Object.entries(envValues).map(([k, v]) => (
            <ListItem key={k}>
              <ListItemText primary={k} secondary={v || '(empty)'} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Connectivity</Typography>
        <Typography variant="body2" gutterBottom>API Base: {currentApiBase() || '(mock mode)'}</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onCheck}>Check API</Button>
        </Stack>
      </Paper>
    </>
  );
}

export default SettingsPage;
