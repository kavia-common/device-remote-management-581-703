/**
 * Realtime API client for SSE (Server-Sent Events) and WebSocket connections
 * Supports JWT Authorization, X-Tenant-Id header, automatic reconnection with exponential backoff
 */

// Configuration from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const REALTIME_MODE = process.env.REACT_APP_REALTIME_MODE || 'sse'; // 'sse' or 'ws'
const REALTIME_ENDPOINT = process.env.REACT_APP_REALTIME_ENDPOINT || '/realtime/events';

// Reconnection configuration
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

/**
 * PUBLIC_INTERFACE
 * SSE Client for real-time event streaming
 * Handles connection lifecycle, authentication, and automatic reconnection
 */
class SSEClient {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.retryDelay = INITIAL_RETRY_DELAY;
    this.retryTimeout = null;
    this.isConnecting = false;
    this.isManualClose = false;
    this.token = null;
    this.tenantId = null;
    this.connectionCallbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * PUBLIC_INTERFACE
   * Connect to SSE endpoint with authentication
   * @param {string} token - JWT authentication token
   * @param {string|null} tenantId - Tenant ID for multi-tenancy
   */
  connect(token, tenantId = null) {
    if (this.isConnecting || (this.eventSource && this.eventSource.readyState === EventSource.OPEN)) {
      return;
    }

    this.token = token;
    this.tenantId = tenantId;
    this.isManualClose = false;
    this.isConnecting = true;

    try {
      // Build URL with auth parameters
      const url = new URL(REALTIME_ENDPOINT, API_BASE_URL.replace('/api', ''));
      url.searchParams.set('token', token);
      if (tenantId) {
        url.searchParams.set('tenantId', tenantId);
      }

      this.eventSource = new EventSource(url.toString());

      this.eventSource.onopen = () => {
        console.log('[SSE] Connection established');
        this.isConnecting = false;
        this.retryDelay = INITIAL_RETRY_DELAY;
        this.notifyConnectionCallbacks({ status: 'connected' });
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.isConnecting = false;
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.notifyConnectionCallbacks({ status: 'disconnected' });
          this.notifyErrorCallbacks(error);
          
          // Attempt reconnection if not manually closed
          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
        }
      };

      // Register default event listeners
      this.registerDefaultListeners();

    } catch (error) {
      console.error('[SSE] Failed to establish connection:', error);
      this.isConnecting = false;
      this.notifyErrorCallbacks(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Register listeners for standard event types
   * @private
   */
  registerDefaultListeners() {
    // Job update events
    this.addEventListener('job_update', (event) => {
      this.notifyListeners('job_update', this.parseEventData(event.data));
    });

    // Job complete events
    this.addEventListener('job_complete', (event) => {
      this.notifyListeners('job_complete', this.parseEventData(event.data));
    });

    // Job error events
    this.addEventListener('job_error', (event) => {
      this.notifyListeners('job_error', this.parseEventData(event.data));
    });

    // Generic message events (fallback)
    this.eventSource.onmessage = (event) => {
      this.notifyListeners('message', this.parseEventData(event.data));
    };
  }

  /**
   * Parse event data safely
   * @private
   */
  parseEventData(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('[SSE] Failed to parse event data:', error);
      return data;
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   * @private
   */
  scheduleReconnect() {
    if (this.isManualClose || this.retryTimeout) {
      return;
    }

    console.log(`[SSE] Reconnecting in ${this.retryDelay}ms...`);
    this.notifyConnectionCallbacks({ status: 'reconnecting', delay: this.retryDelay });

    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.connect(this.token, this.tenantId);
      
      // Increase delay for next retry (exponential backoff)
      this.retryDelay = Math.min(this.retryDelay * BACKOFF_MULTIPLIER, MAX_RETRY_DELAY);
    }, this.retryDelay);
  }

  /**
   * PUBLIC_INTERFACE
   * Add event listener for specific event type
   * @param {string} eventType - Event type to listen for
   * @param {Function} callback - Callback function to invoke
   */
  addEventListener(eventType, callback) {
    if (!this.eventSource) {
      console.warn('[SSE] EventSource not initialized');
      return;
    }

    this.eventSource.addEventListener(eventType, callback);
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to event channel with callback
   * @param {string} channel - Channel/event type to subscribe to
   * @param {Function} handler - Handler function for events
   * @returns {Function} Unsubscribe function
   */
  subscribe(channel, handler) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    
    this.listeners.get(channel).add(handler);

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(handler);
        if (channelListeners.size === 0) {
          this.listeners.delete(channel);
        }
      }
    };
  }

  /**
   * Notify all listeners for a specific channel
   * @private
   */
  notifyListeners(channel, data) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[SSE] Error in listener for ${channel}:`, error);
        }
      });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Register callback for connection status changes
   * @param {Function} callback - Callback function
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Notify connection callbacks
   * @private
   */
  notifyConnectionCallbacks(status) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[SSE] Error in connection callback:', error);
      }
    });
  }

  /**
   * PUBLIC_INTERFACE
   * Register callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Notify error callbacks
   * @private
   */
  notifyErrorCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('[SSE] Error in error callback:', err);
      }
    });
  }

  /**
   * PUBLIC_INTERFACE
   * Disconnect from SSE endpoint
   */
  disconnect() {
    this.isManualClose = true;
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.listeners.clear();
    this.notifyConnectionCallbacks({ status: 'disconnected' });
  }

  /**
   * PUBLIC_INTERFACE
   * Get current connection state
   * @returns {string} Connection state: 'connecting', 'open', 'closed'
   */
  getState() {
    if (!this.eventSource) return 'closed';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'open';
      case EventSource.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * WebSocket Client for real-time bidirectional communication
 * Handles connection lifecycle, authentication, and automatic reconnection
 */
class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.retryDelay = INITIAL_RETRY_DELAY;
    this.retryTimeout = null;
    this.isConnecting = false;
    this.isManualClose = false;
    this.token = null;
    this.tenantId = null;
    this.connectionCallbacks = [];
    this.errorCallbacks = [];
    this.pingInterval = null;
    this.PING_INTERVAL = 30000; // 30 seconds
  }

  /**
   * PUBLIC_INTERFACE
   * Connect to WebSocket endpoint with authentication
   * @param {string} token - JWT authentication token
   * @param {string|null} tenantId - Tenant ID for multi-tenancy
   */
  connect(token, tenantId = null) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.token = token;
    this.tenantId = tenantId;
    this.isManualClose = false;
    this.isConnecting = true;

    try {
      // Build WebSocket URL
      const wsBaseUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = new URL(REALTIME_ENDPOINT, wsBaseUrl.replace('/api', ''));
      url.searchParams.set('token', token);
      if (tenantId) {
        url.searchParams.set('tenantId', tenantId);
      }

      this.ws = new WebSocket(url.toString());

      this.ws.onopen = () => {
        console.log('[WebSocket] Connection established');
        this.isConnecting = false;
        this.retryDelay = INITIAL_RETRY_DELAY;
        this.notifyConnectionCallbacks({ status: 'connected' });
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;
          
          if (type === 'pong') {
            // Ignore pong messages
            return;
          }
          
          this.notifyListeners(type, data);
          this.notifyListeners('message', message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        this.notifyErrorCallbacks(error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.isConnecting = false;
        this.stopPing();
        this.notifyConnectionCallbacks({ status: 'disconnected' });
        
        // Attempt reconnection if not manually closed
        if (!this.isManualClose) {
          this.scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('[WebSocket] Failed to establish connection:', error);
      this.isConnecting = false;
      this.notifyErrorCallbacks(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Start ping interval to keep connection alive
   * @private
   */
  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.PING_INTERVAL);
  }

  /**
   * Stop ping interval
   * @private
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   * @private
   */
  scheduleReconnect() {
    if (this.isManualClose || this.retryTimeout) {
      return;
    }

    console.log(`[WebSocket] Reconnecting in ${this.retryDelay}ms...`);
    this.notifyConnectionCallbacks({ status: 'reconnecting', delay: this.retryDelay });

    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.connect(this.token, this.tenantId);
      
      // Increase delay for next retry (exponential backoff)
      this.retryDelay = Math.min(this.retryDelay * BACKOFF_MULTIPLIER, MAX_RETRY_DELAY);
    }, this.retryDelay);
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to event channel with callback
   * @param {string} channel - Channel/event type to subscribe to
   * @param {Function} handler - Handler function for events
   * @returns {Function} Unsubscribe function
   */
  subscribe(channel, handler) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    
    this.listeners.get(channel).add(handler);

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(handler);
        if (channelListeners.size === 0) {
          this.listeners.delete(channel);
        }
      }
    };
  }

  /**
   * Notify all listeners for a specific channel
   * @private
   */
  notifyListeners(channel, data) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for ${channel}:`, error);
        }
      });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Send message to server
   * @param {string} type - Message type
   * @param {*} data - Message data
   */
  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('[WebSocket] Cannot send message, not connected');
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Register callback for connection status changes
   * @param {Function} callback - Callback function
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Notify connection callbacks
   * @private
   */
  notifyConnectionCallbacks(status) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[WebSocket] Error in connection callback:', error);
      }
    });
  }

  /**
   * PUBLIC_INTERFACE
   * Register callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Notify error callbacks
   * @private
   */
  notifyErrorCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('[WebSocket] Error in error callback:', err);
      }
    });
  }

  /**
   * PUBLIC_INTERFACE
   * Disconnect from WebSocket endpoint
   */
  disconnect() {
    this.isManualClose = true;
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.stopPing();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
    this.notifyConnectionCallbacks({ status: 'disconnected' });
  }

  /**
   * PUBLIC_INTERFACE
   * Get current connection state
   * @returns {string} Connection state: 'connecting', 'open', 'closing', 'closed'
   */
  getState() {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Create realtime client based on configured mode
 * @returns {SSEClient|WebSocketClient} Realtime client instance
 */
export const createRealtimeClient = () => {
  if (REALTIME_MODE === 'ws') {
    return new WebSocketClient();
  }
  return new SSEClient();
};

// Export singleton instance
let realtimeClient = null;

/**
 * PUBLIC_INTERFACE
 * Get or create singleton realtime client instance
 * @returns {SSEClient|WebSocketClient} Realtime client instance
 */
export const getRealtimeClient = () => {
  if (!realtimeClient) {
    realtimeClient = createRealtimeClient();
  }
  return realtimeClient;
};

/**
 * PUBLIC_INTERFACE
 * Reset realtime client (useful for testing or re-initialization)
 */
export const resetRealtimeClient = () => {
  if (realtimeClient) {
    realtimeClient.disconnect();
    realtimeClient = null;
  }
};

export default getRealtimeClient;
