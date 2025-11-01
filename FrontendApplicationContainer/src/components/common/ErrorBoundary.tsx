import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// PUBLIC_INTERFACE
export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  /** Catches errors in child components and renders a fallback UI. */
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Add logging here if needed
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
