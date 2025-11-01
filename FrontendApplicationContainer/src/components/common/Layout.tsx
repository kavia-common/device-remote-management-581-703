import React, { PropsWithChildren } from 'react';
import { Nav } from './Nav';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Loading } from './Loading';

export interface LayoutProps extends PropsWithChildren {
  showNavWhenLoggedIn?: boolean;
}

// PUBLIC_INTERFACE
export function Layout({ children, showNavWhenLoggedIn = true }: LayoutProps): JSX.Element {
  /**
   * Simple page layout including top nav (when authenticated).
   */
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { loading } = useSelector((s: RootState) => s.ui);

  return (
    <div className="App">
      {showNavWhenLoggedIn && isAuthenticated ? <Nav /> : null}
      {loading ? <Loading /> : null}
      <main className="container" style={{ paddingTop: 24 }}>{children}</main>
    </div>
  );
}
