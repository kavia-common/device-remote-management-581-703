const REALTIME_PROTOCOL = (process.env.REACT_APP_REALTIME_PROTOCOL || 'sse').toLowerCase();

// PUBLIC_INTERFACE
/**
 * Connect to realtime updates using SSE with auto-reconnect.
 * Endpoint: GET {REACT_APP_API_URL}/realtime/sse
 * Events: job_submitted, job_progress, job_completed, job_failed, favorite_updated
 *
 * Usage:
 * const disconnect = connectRealtime((evt) => { console.log(evt.type, evt.payload); });
 * // later: disconnect();
 */
export const connectRealtime = (onEvent, opts) => {
  const options = opts || {};
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const url = baseUrl.replace(/\/+$/, '') + '/realtime/sse';
  const retryMs = Number(options.retryMs || 3000);

  let closed = false;
  let es = null;

  function connect() {
    if (REALTIME_PROTOCOL === 'ws') {
      // Placeholder for future WebSocket support
      // eslint-disable-next-line no-console
      console.warn('WebSocket protocol selected but not implemented; using SSE fallback');
    }

    try {
      es = new EventSource(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[realtime] failed to create EventSource', e);
      scheduleReconnect();
      return;
    }

    function safeParse(e) {
      try {
        return JSON.parse(e.data);
      } catch (err) {
        return null;
      }
    }

    es.onopen = function onopen() {
      if (process.env.REACT_APP_DEBUG === 'true') {
        // eslint-disable-next-line no-console
        console.log('[realtime] connected');
      }
    };

    es.onerror = function onerror() {
      if (closed) return;
      if (process.env.REACT_APP_DEBUG === 'true') {
        // eslint-disable-next-line no-console
        console.log('[realtime] connection error, retrying...');
      }
      try {
        es.close();
      } catch (e) {
        // ignore
      }
      scheduleReconnect();
    };

    var eventNames = [
      'job_submitted',
      'job_progress',
      'job_completed',
      'job_failed',
      'favorite_updated',
      'message',
    ];

    eventNames.forEach(function register(evt) {
      es.addEventListener(evt, function handler(e) {
        var payload = safeParse(e);
        if (payload && typeof onEvent === 'function') {
          onEvent({ type: evt, payload: payload });
        }
      });
    });
  }

  function scheduleReconnect() {
    setTimeout(function retry() {
      if (!closed) {
        connect();
      }
    }, retryMs);
  }

  // initial connect
  connect();

  // return disconnect function
  return function disconnect() {
    closed = true;
    if (es) {
      try {
        es.close();
      } catch (e) {
        // ignore
      }
      es = null;
    }
  };
};

export default { connectRealtime };
