import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentTenant } from '../store/slices/authSlice';
import {
  handleRealtimeJobUpdate,
  handleRealtimeJobComplete,
  handleRealtimeJobError,
  setRealtimeConnected,
} from '../store/slices/queriesSlice';
import { getRealtimeClient } from '../api/realtime';

const RealtimeContext = createContext({
  // PUBLIC_INTERFACE
  subscribe: (_channel, _handler) => {
    // Returns an unsubscribe noop
    return () => {};
  },
  // PUBLIC_INTERFACE
  publish: (_channel, _payload) => {},
  // PUBLIC_INTERFACE
  connectionStatus: 'disconnected',
});

/**
 * PUBLIC_INTERFACE
 * RealtimeProvider manages real-time connections via SSE or WebSocket
 * Integrates with auth context for JWT token and tenant ID
 * Dispatches Redux actions for job updates, completions, and errors
 * Supports automatic reconnection with exponential backoff
 * Gracefully handles backend unavailability without breaking changes
 */
export function RealtimeProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentTenant = useSelector(selectCurrentTenant);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [realtimeClient, setRealtimeClient] = useState(null);

  /**
   * Initialize realtime client when authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if not authenticated
      if (realtimeClient) {
        realtimeClient.disconnect();
        setRealtimeClient(null);
      }
      setConnectionStatus('disconnected');
      dispatch(setRealtimeConnected(false));
      return;
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[RealtimeProvider] No token found, skipping connection');
      return;
    }

    // Create and configure client if not already initialized
    let client = realtimeClient;
    if (!client) {
      client = getRealtimeClient();
      setRealtimeClient(client);
    }

    // Register connection status callback
    client.onConnectionChange((status) => {
      console.log('[RealtimeProvider] Connection status:', status);
      setConnectionStatus(status.status);
      dispatch(setRealtimeConnected(status.status === 'connected'));
    });

    // Register error callback
    client.onError((error) => {
      console.error('[RealtimeProvider] Connection error:', error);
      // Don't treat connection errors as critical - backend may not be available yet
    });

    // Subscribe to job events
    const unsubscribeUpdate = client.subscribe('job_update', (data) => {
      console.log('[RealtimeProvider] Job update:', data);
      dispatch(handleRealtimeJobUpdate(data));
    });

    const unsubscribeComplete = client.subscribe('job_complete', (data) => {
      console.log('[RealtimeProvider] Job complete:', data);
      dispatch(handleRealtimeJobComplete(data));
    });

    const unsubscribeError = client.subscribe('job_error', (data) => {
      console.log('[RealtimeProvider] Job error:', data);
      dispatch(handleRealtimeJobError(data));
    });

    // Connect with auth token and tenant ID
    try {
      client.connect(token, currentTenant);
    } catch (error) {
      console.warn('[RealtimeProvider] Failed to connect, backend may not be ready:', error);
      // Non-blocking error - app continues to function without realtime updates
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribeUpdate();
      unsubscribeComplete();
      unsubscribeError();
      if (client) {
        client.disconnect();
      }
    };
  }, [isAuthenticated, currentTenant, dispatch, realtimeClient]);

  /**
   * Subscribe to custom event channel
   */
  const subscribe = useCallback((channel, handler) => {
    if (!realtimeClient) {
      console.warn('[RealtimeProvider] Client not initialized, cannot subscribe');
      return () => {};
    }
    
    return realtimeClient.subscribe(channel, handler);
  }, [realtimeClient]);

  /**
   * Publish message (only for WebSocket mode)
   */
  const publish = useCallback((channel, payload) => {
    if (!realtimeClient) {
      console.warn('[RealtimeProvider] Client not initialized, cannot publish');
      return;
    }
    
    if (typeof realtimeClient.send === 'function') {
      realtimeClient.send(channel, payload);
    } else {
      console.warn('[RealtimeProvider] Publish not supported in SSE mode');
    }
  }, [realtimeClient]);

  const value = useMemo(() => ({ 
    subscribe, 
    publish, 
    connectionStatus,
  }), [subscribe, publish, connectionStatus]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export default RealtimeContext;
