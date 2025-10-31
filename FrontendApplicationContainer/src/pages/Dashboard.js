import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { fetchDeviceStats } from '../store/slices/devicesSlice';
import { fetchQueryHistory } from '../store/slices/queriesSlice';

// PUBLIC_INTERFACE
/**
 * Dashboard page component
 * Displays overview statistics and protocol information
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading: devicesLoading } = useSelector((state) => state.devices);
  const { history, loading: queriesLoading } = useSelector((state) => state.queries);

  useEffect(() => {
    dispatch(fetchDeviceStats());
    dispatch(fetchQueryHistory({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const statsCards = [
    {
      title: 'Total Devices',
      value: stats?.totalDevices || 0,
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Devices',
      value: stats?.activeDevices || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Inactive Devices',
      value: stats?.inactiveDevices || 0,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Failed Queries',
      value: stats?.failedQueries || 0,
      icon: <ErrorIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  const protocolStats = [
    { name: 'SNMP', count: stats?.snmpDevices || 0 },
    { name: 'WebPA', count: stats?.webpaDevices || 0 },
    { name: 'TR-69', count: stats?.tr69Devices || 0 },
    { name: 'TR-369', count: stats?.tr369Devices || 0 },
  ];

  if (devicesLoading || queriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Devices by Protocol
            </Typography>
            <Box sx={{ mt: 2 }}>
              {protocolStats.map((protocol) => (
                <Box
                  key={protocol.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">{protocol.name}</Typography>
                  <Typography variant="h6" color="primary">
                    {protocol.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Queries
            </Typography>
            <Box sx={{ mt: 2 }}>
              {history.slice(0, 5).map((query, index) => (
                <Box
                  key={query.id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <Box>
                    <Typography variant="body2">{query.protocol || 'N/A'}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {query.timestamp || 'N/A'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: query.status === 'completed' ? '#2e7d32' : '#ed6c02',
                      fontWeight: 600,
                    }}
                  >
                    {query.status || 'Unknown'}
                  </Typography>
                </Box>
              ))}
              {history.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No recent queries
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
