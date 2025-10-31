import { createRealtimeClient, getRealtimeClient, resetRealtimeClient } from '../realtime';

describe('Realtime API Client', () => {
  let originalEventSource;
  let originalWebSocket;
  
  beforeEach(() => {
    // Save originals
    originalEventSource = global.EventSource;
    originalWebSocket = global.WebSocket;
    
    // Reset singleton
    resetRealtimeClient();
  });
  
  afterEach(() => {
    // Restore originals
    if (originalEventSource) global.EventSource = originalEventSource;
    if (originalWebSocket) global.WebSocket = originalWebSocket;
    
    // Cleanup
    resetRealtimeClient();
  });
  
  describe('createRealtimeClient', () => {
    it('should create SSE client by default', () => {
      const client = createRealtimeClient();
      expect(client).toBeDefined();
      expect(client.constructor.name).toBe('SSEClient');
    });
    
    it('should create SSE client when mode is empty', () => {
      const client = createRealtimeClient();
      expect(client).toBeDefined();
      expect(client.constructor.name).toBe('SSEClient');
    });
  });
  
  describe('getRealtimeClient', () => {
    it('should return singleton instance', () => {
      const client1 = getRealtimeClient();
      const client2 = getRealtimeClient();
      expect(client1).toBe(client2);
    });
    
    it('should create new instance after reset', () => {
      const client1 = getRealtimeClient();
      resetRealtimeClient();
      const client2 = getRealtimeClient();
      expect(client1).not.toBe(client2);
    });
  });
  
  describe('SSEClient interface', () => {
    let client;
    
    beforeEach(() => {
      client = createRealtimeClient();
    });
    
    it('should have connect method', () => {
      expect(typeof client.connect).toBe('function');
    });
    
    it('should have disconnect method', () => {
      expect(typeof client.disconnect).toBe('function');
    });
    
    it('should have subscribe method', () => {
      expect(typeof client.subscribe).toBe('function');
    });
    
    it('should have getState method', () => {
      expect(typeof client.getState).toBe('function');
    });
    
    it('should have onConnectionChange method', () => {
      expect(typeof client.onConnectionChange).toBe('function');
    });
    
    it('should have onError method', () => {
      expect(typeof client.onError).toBe('function');
    });
    
    it('should return closed state when not connected', () => {
      expect(client.getState()).toBe('closed');
    });
    
    it('should register connection callbacks', () => {
      const callback = jest.fn();
      client.onConnectionChange(callback);
      expect(client.connectionCallbacks).toContain(callback);
    });
    
    it('should register error callbacks', () => {
      const callback = jest.fn();
      client.onError(callback);
      expect(client.errorCallbacks).toContain(callback);
    });
    
    it('should return unsubscribe function from subscribe', () => {
      const handler = jest.fn();
      const unsubscribe = client.subscribe('test_event', handler);
      expect(typeof unsubscribe).toBe('function');
      
      // Verify handler was registered
      expect(client.listeners.has('test_event')).toBe(true);
      
      // Unsubscribe
      unsubscribe();
      
      // Verify handler was removed
      const listeners = client.listeners.get('test_event');
      expect(listeners?.size || 0).toBe(0);
    });
  });
  
  describe('Reconnection logic', () => {
    let client;
    
    beforeEach(() => {
      client = createRealtimeClient();
    });
    
    it('should have initial retry delay of 1000ms', () => {
      expect(client.retryDelay).toBe(1000);
    });
    
    it('should set manual close flag on disconnect', () => {
      client.isManualClose = false;
      client.disconnect();
      expect(client.isManualClose).toBe(true);
    });
    
    it('should clear retry timeout on disconnect', () => {
      client.retryTimeout = setTimeout(() => {}, 5000);
      
      client.disconnect();
      
      expect(client.retryTimeout).toBeNull();
    });
    
    it('should clear listeners on disconnect', () => {
      client.subscribe('test_event', jest.fn());
      expect(client.listeners.size).toBeGreaterThan(0);
      
      client.disconnect();
      
      expect(client.listeners.size).toBe(0);
    });
  });
  
  describe('Event subscription', () => {
    let client;
    
    beforeEach(() => {
      client = createRealtimeClient();
    });
    
    it('should allow multiple subscriptions to same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      client.subscribe('test_event', handler1);
      client.subscribe('test_event', handler2);
      
      const listeners = client.listeners.get('test_event');
      expect(listeners?.size).toBe(2);
    });
    
    it('should remove only specified handler on unsubscribe', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const unsubscribe1 = client.subscribe('test_event', handler1);
      client.subscribe('test_event', handler2);
      
      unsubscribe1();
      
      const listeners = client.listeners.get('test_event');
      expect(listeners?.size).toBe(1);
      expect(listeners?.has(handler2)).toBe(true);
    });
    
    it('should clean up event channel when last handler unsubscribes', () => {
      const handler = jest.fn();
      const unsubscribe = client.subscribe('test_event', handler);
      
      expect(client.listeners.has('test_event')).toBe(true);
      
      unsubscribe();
      
      expect(client.listeners.has('test_event')).toBe(false);
    });
  });
  
  describe('Configuration', () => {
    it('should use default endpoint when not configured', () => {
      delete process.env.REACT_APP_REALTIME_ENDPOINT;
      const client = createRealtimeClient();
      expect(client).toBeDefined();
    });
    
    it('should handle missing API base URL', () => {
      delete process.env.REACT_APP_API_URL;
      const client = createRealtimeClient();
      expect(client).toBeDefined();
    });
  });
});
