import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AppErrorBoundary is a reusable error boundary component that catches runtime errors
 * in its child component tree, logs them (no-op by default), and displays a friendly
 * fallback UI. This avoids breaking the entire app on unexpected errors.
 */
export class AppErrorBoundary extends React.Component {
  /**
   * Create an AppErrorBoundary instance.
   * @param {object} props - React props including optional fallback UI.
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * React lifecycle method to update state when an error is thrown.
   * @param {Error} error - The error that was thrown.
   * @returns {{hasError: boolean, error: Error}}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * React lifecycle method for performing side effects after an error is caught.
   * @param {Error} error - The error that was thrown.
   * @param {object} errorInfo - Additional info about the error.
   */
  componentDidCatch(error, errorInfo) {
    // Minimal/no-op logging; can be wired to a logging service in the future.
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Reset error boundary state, useful for retry actions.
   */
  // PUBLIC_INTERFACE
  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render provided fallback if available; otherwise render a simple default.
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, reset: this.reset })
          : fallback;
      }
      return (
        <div role="alert" style={{ padding: 16 }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error?.message}</pre>
          <button onClick={this.reset} style={{ marginTop: 8 }}>
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default AppErrorBoundary;
