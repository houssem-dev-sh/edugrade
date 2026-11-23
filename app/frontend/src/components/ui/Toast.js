import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import Close from '@mui/icons-material/Close';

const ToastContext = createContext(() => {});

const MAX_VISIBLE = 3;
const DURATION_MS = { success: 4000, error: 7000 };

// Short confirmations ("Student added") shown in the corner of the app.
// Usage: const notify = useToast(); notify('Student added'); notify('Something failed', 'error');
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const lastId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, tone = 'success') => {
      lastId.current += 1;
      const id = lastId.current;
      setToasts((list) => [...list.slice(1 - MAX_VISIBLE), { id, message, tone }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS[tone] || DURATION_MS.success));
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="af-toasts" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`af-toast tone-${toast.tone}`}
            role={toast.tone === 'error' ? 'alert' : undefined}
          >
            <span className="af-toast-icon" aria-hidden="true">
              {toast.tone === 'error' ? (
                <ErrorOutlineOutlined fontSize="inherit" />
              ) : (
                <CheckCircleOutlineOutlined fontSize="inherit" />
              )}
            </span>
            <span className="af-toast-text">{toast.message}</span>
            <button
              type="button"
              className="af-icon-btn af-toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              <Close fontSize="inherit" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
