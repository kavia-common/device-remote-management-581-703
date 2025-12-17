import React from 'react';
import { Typography, Paper } from '@mui/material';

// PUBLIC_INTERFACE
function Help() {
  return (
    <>
      <Typography variant="h4" gutterBottom>Help</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          This is a placeholder for documentation and onboarding content.
        </Typography>
      </Paper>
    </>
  );
}

export default Help;
