import React, { createContext, useCallback, useMemo, useState } from 'react';

const ToastContext = createContext({
  // PUBLIC_INTERFACE
  showToast: (_message, _options) => {},
  // PUBLIC_INTERFACE
  dismissToast: (_id) => {},
});

/**
 * PUBLIC_INTERFACE
 * ToastProvider provides a minimal toast notification context for the app.
 * Currently uses in-memory state and simple rendering. No external deps or styles.
 */
export function ToastProvider({ children, maxToasts = 5, renderInline = true }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: typeof options.duration === 'number' ? options.duration : 3000,
    };
    setToasts((prev) => {
      const next = [...prev, toast];
      if (next.length > maxToasts) {
        next.shift();
      }
      return next;
    });

    if (toast.duration > 0) {
      setTimeout(() => dismissToast(id), toast.duration);
    }
    return id;
  }, [dismissToast, maxToasts]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {renderInline && toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 360,
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                color: '#1f2937',
                background:
                  t.type === 'error' ? '#fee2e2' :
                  t.type === 'success' ? '#dcfce7' :
                  t.type === 'warning' ? '#fef9c3' :
                  '#e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ textTransform: 'capitalize' }}>{t.type}</strong>
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss notification"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastContext;
