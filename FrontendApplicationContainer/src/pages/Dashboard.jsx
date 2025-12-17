import React from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import LanIcon from '@mui/icons-material/Lan';
import RouterIcon from '@mui/icons-material/Router';
import HubIcon from '@mui/icons-material/Hub';
import DevicesIcon from '@mui/icons-material/Devices';

const tiles = [
  { name: 'SNMP', to: '/protocols/snmp', description: 'SNMP v2/v3 operations', icon: LanIcon, color: '#1976d2' },
  { name: 'WebPA', to: '/protocols/webpa', description: 'WebPA protocol operations', icon: RouterIcon, color: '#9c27b0' },
  { name: 'TR-069', to: '/protocols/tr69', description: 'TR-069 / ACS operations', icon: HubIcon, color: '#2e7d32' },
  { name: 'TR-369 / USP', to: '/protocols/tr369', description: 'USP operations', icon: HubIcon, color: '#ed6c02' },
];

// PUBLIC_INTERFACE
function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={3}>
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={t.name}>
              <Card elevation={2}>
                <CardActionArea component={Link} to={t.to} sx={{ height: '100%', minHeight: 150 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Icon sx={{ fontSize: 40, color: t.color, mr: 2 }} />
                      <Typography variant="h6">{t.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardActionArea component={Link} to="/devices" sx={{ height: '100%', minHeight: 150 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DevicesIcon sx={{ fontSize: 40, color: '#0288d1', mr: 2 }} />
                  <Typography variant="h6">Devices</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Manage all devices</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
