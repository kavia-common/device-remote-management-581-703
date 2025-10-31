import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// PUBLIC_INTERFACE
/**
 * Unauthorized page component
 * Displayed when user attempts to access a resource without required permissions
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 200px)"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have the required permissions to access this resource.
          Please contact your administrator if you believe this is an error.
        </Typography>
        <Box mt={3}>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Go Back
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
