import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (msg: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const toast = useCallback((msg: string, durationMs = 3000) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className={`fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg transition-all duration-200 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
