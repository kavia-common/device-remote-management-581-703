import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';
import { settingsApi } from '../../services/api';

// PUBLIC_INTERFACE
const Settings = () => {
  const [userSettings, setUserSettings] = useState({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      timezone: 'UTC',
    },
    notifications: {
      emailNotifications: true,
      queryCompletionNotifications: true,
      deviceStatusAlerts: true,
      systemMaintenance: false,
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      defaultPageSize: 10,
      autoRefreshInterval: 30,
    },
    security: {
      sessionTimeout: 30,
      twoFactorEnabled: false,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['userSettings'],
    queryFn: settingsApi.getUserSettings,
    onSuccess: (data) => {
      if (data?.data) {
        setUserSettings({ ...userSettings, ...data.data });
      }
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['userSettings']);
      setHasChanges(false);
    },
  });

  const handleInputChange = (section, field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(userSettings);
  };

  const handleReset = () => {
    if (settingsData?.data) {
      setUserSettings({ ...userSettings, ...settingsData.data });
    }
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Settings</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={!hasChanges || updateSettingsMutation.isPending}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasChanges || updateSettingsMutation.isPending}
            startIcon={updateSettingsMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load settings: {error.message}
        </Alert>
      )}

      {updateSettingsMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {updateSettingsMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to save settings: {updateSettingsMutation.error?.message || 'Unknown error'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Profile Information</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="First Name"
                  value={userSettings.profile.firstName}
                  onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={userSettings.profile.lastName}
                  onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={userSettings.profile.email}
                  onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={userSettings.profile.timezone}
                    onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.emailNotifications}
                      onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.queryCompletionNotifications}
                      onChange={(e) => handleInputChange('notifications', 'queryCompletionNotifications', e.target.checked)}
                    />
                  }
                  label="Query Completion Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.deviceStatusAlerts}
                      onChange={(e) => handleInputChange('notifications', 'deviceStatusAlerts', e.target.checked)}
                    />
                  }
                  label="Device Status Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.systemMaintenance}
                      onChange={(e) => handleInputChange('notifications', 'systemMaintenance', e.target.checked)}
                    />
                  }
                  label="System Maintenance Notifications"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ThemeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Preferences</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={userSettings.preferences.theme}
                    onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={userSettings.preferences.language}
                    onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Default Page Size</InputLabel>
                  <Select
                    value={userSettings.preferences.defaultPageSize}
                    onChange={(e) => handleInputChange('preferences', 'defaultPageSize', e.target.value)}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Auto-refresh Interval (seconds)"
                  type="number"
                  value={userSettings.preferences.autoRefreshInterval}
                  onChange={(e) => handleInputChange('preferences', 'autoRefreshInterval', parseInt(e.target.value))}
                  inputProps={{ min: 10, max: 300 }}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Security</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Session Timeout (minutes)</InputLabel>
                  <Select
                    value={userSettings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={480}>8 hours</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.security.twoFactorEnabled}
                      onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Frontend Version
                  </Typography>
                  <Typography variant="body1">
                    v1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    API Endpoint
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1">
                    {process.env.REACT_APP_NODE_ENV || 'development'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Build Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
