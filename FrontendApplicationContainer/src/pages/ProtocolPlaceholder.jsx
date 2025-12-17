import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Paper } from '@mui/material';

// PUBLIC_INTERFACE
function ProtocolPlaceholderPage({ title, description }) {
  const params = useParams();
  const derivedTitle = title || (params?.name ? params.name.toUpperCase() : 'Protocol');
  const derivedDesc = description || 'Feature will be implemented in a future iteration.';
  return (
    <>
      <Typography variant="h4" gutterBottom>{derivedTitle}</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">{derivedDesc}</Typography>
      </Paper>
    </>
  );
}

export default ProtocolPlaceholderPage;
