import React from 'react';

// PUBLIC_INTERFACE
export function Loading(): JSX.Element {
  /** Simple loading indicator. */
  return (
    <div style={{ padding: 16, textAlign: 'center' }}>
      <span role="img" aria-label="hourglass">⏳</span> Loading...
    </div>
  );
}
