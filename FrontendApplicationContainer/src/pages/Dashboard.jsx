import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const tiles = [
  { name: 'SNMP', to: '/protocols/snmp', description: 'SNMP v2/v3 operations' },
  { name: 'WebPA', to: '/protocols/webpa', description: 'WebPA protocol operations' },
  { name: 'TR-069', to: '/protocols/tr69', description: 'TR-069 / ACS operations' },
  { name: 'TR-369 / USP', to: '/protocols/tr369', description: 'USP operations' },
];

// PUBLIC_INTERFACE
function DashboardPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        {tiles.map((t) => (
          <Grid item xs={12} sm={6} md={3} key={t.name}>
            <Card component={Link} to={t.to} sx={{ textDecoration: 'none' }}>
              <CardContent>
                <Typography variant="h6">{t.name}</Typography>
                <Typography variant="body2" color="text.secondary">{t.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default DashboardPage;
