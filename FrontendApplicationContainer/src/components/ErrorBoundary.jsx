import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Something went wrong</AlertTitle>
          {this.state.error?.message || 'Unknown error'}
        </Alert>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
