import { useContext } from 'react';
import RealtimeContext from '../components/RealtimeProvider';

/**
 * PUBLIC_INTERFACE
 * Custom hook to access realtime context
 * Provides subscribe, publish, and connectionStatus
 * 
 * @returns {Object} Realtime context value
 * @returns {Function} returns.subscribe - Subscribe to event channel
 * @returns {Function} returns.publish - Publish message (WebSocket only)
 * @returns {string} returns.connectionStatus - Connection status: 'connected', 'disconnected', 'reconnecting'
 * 
 * @example
 * const { subscribe, connectionStatus } = useRealtime();
 * 
 * useEffect(() => {
 *   const unsubscribe = subscribe('job_update', (data) => {
 *     console.log('Job update:', data);
 *   });
 *   return unsubscribe;
 * }, [subscribe]);
 */
export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export default useRealtime;
