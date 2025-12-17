import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Stack, Chip, Alert, Box } from '@mui/material';
import { apiHealth, currentApiBase, isMockMode } from '../api';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../store/uiSlice';

// PUBLIC_INTERFACE
function SettingsPage() {
  const dispatch = useDispatch();
  const [healthStatus, setHealthStatus] = React.useState(null);
  const [healthLoading, setHealthLoading] = React.useState(false);

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
    setHealthLoading(true);
    try {
      const res = await apiHealth();
      setHealthStatus(res);
      dispatch(showSnackbar({
        message: `Health: ${res?.status || 'ok'}`,
        severity: 'success'
      }));
    } catch (e) {
      setHealthStatus({ status: 'error', error: e.message });
      dispatch(showSnackbar({
        message: 'Health check failed',
        severity: 'error'
      }));
    } finally {
      setHealthLoading(false);
    }
  };

  const mockModeActive = isMockMode();
  const apiBase = currentApiBase();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Settings</Typography>

      {mockModeActive && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Mock mode is active. Set REACT_APP_API_BASE to connect to a real backend.
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Environment Configuration</Typography>
        <List dense>
          {Object.entries(envValues).map(([k, v]) => (
            <ListItem key={k}>
              <ListItemText primary={k} secondary={v || '(empty)'} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>API Connectivity</Typography>
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            <strong>Mode:</strong>{' '}
            <Chip
              label={mockModeActive ? 'Mock' : 'Real Backend'}
              color={mockModeActive ? 'default' : 'primary'}
              size="small"
            />
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>API Base:</strong> {apiBase || '(none - using mock)'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Health Endpoint:</strong> {envValues.REACT_APP_HEALTHCHECK_PATH}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={onCheck} disabled={healthLoading}>
            {healthLoading ? 'Checking...' : 'Check API Health'}
          </Button>
        </Stack>
        {healthStatus && (
          <Box mt={2}>
            <Typography variant="subtitle2">Health Status:</Typography>
            <Box
              component="pre"
              sx={{
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(healthStatus, null, 2)}
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>API Endpoints</Typography>
        <Typography variant="body2" color="text.secondary">
          All endpoints are relative to the API base URL. When mock mode is active, operations use local mock implementations.
        </Typography>
        <List dense sx={{ mt: 1 }}>
          <ListItem><ListItemText primary="/devices" secondary="Device management" /></ListItem>
          <ListItem><ListItemText primary="/protocols/snmp" secondary="SNMP operations" /></ListItem>
          <ListItem><ListItemText primary="/protocols/webpa" secondary="WebPA operations" /></ListItem>
          <ListItem><ListItemText primary="/protocols/tr069" secondary="TR-069 operations" /></ListItem>
          <ListItem><ListItemText primary="/protocols/tr369" secondary="TR-369/USP operations" /></ListItem>
          <ListItem><ListItemText primary="/configuration" secondary="MIB and template management" /></ListItem>
          <ListItem><ListItemText primary="/queries" secondary="Query history and favorites" /></ListItem>
          <ListItem><ListItemText primary="/exports" secondary="Result export operations" /></ListItem>
        </List>
      </Paper>
    </Box>
  );
}

export default SettingsPage;
