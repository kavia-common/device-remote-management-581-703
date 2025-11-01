import React from 'react';
import './App.css';
import AppRouter from './router/index';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/common/Layout';

// PUBLIC_INTERFACE
export default function App(): JSX.Element {
  /**
   * Root application component. Wraps router with shared layout and error boundary.
   */
  return (
    <div className="App">
      <ErrorBoundary>
        <Layout>
          <AppRouter />
        </Layout>
      </ErrorBoundary>
    </div>
  );
}
