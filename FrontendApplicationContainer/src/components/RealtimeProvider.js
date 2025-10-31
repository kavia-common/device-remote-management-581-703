import React, { createContext, useMemo } from 'react';

const RealtimeContext = createContext({
  // PUBLIC_INTERFACE
  subscribe: (_channel, _handler) => {
    // Returns an unsubscribe noop
    return () => {};
  },
  // PUBLIC_INTERFACE
  publish: (_channel, _payload) => {},
});

/**
 * PUBLIC_INTERFACE
 * RealtimeProvider supplies a no-op pub/sub interface for future real-time features.
 * No external connections or credentials are required at this stage.
 */
export function RealtimeProvider({ children }) {
  const subscribe = (_channel, _handler) => {
    // Intentionally a no-op; will be implemented via WebSocket/SSE in future.
    return () => {};
  };

  const publish = (_channel, _payload) => {
    // Intentionally a no-op; can be wired to a message bus later.
  };

  const value = useMemo(() => ({ subscribe, publish }), []);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export default RealtimeContext;
