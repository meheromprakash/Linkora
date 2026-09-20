import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const SingleToast: React.FC<{
  t: ToastItem;
  onClose: (id: string) => void;
}> = ({ t, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={clsx(
        'relative pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-card border bg-white shadow-modal transition-all duration-300 animate-slide-in overflow-hidden',
        t.type === 'success' && 'border-emerald-200 text-slate-800',
        t.type === 'error' && 'border-red-200 text-slate-800',
        t.type === 'info' && 'border-slate-200 text-slate-800'
      )}
    >
      <div className="flex items-center gap-3">
        {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
        {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
        {t.type === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
        <span className="text-sm font-medium text-slate-900">{t.message}</span>
      </div>
      <button
        onClick={() => onClose(t.id)}
        className="text-slate-400 hover:text-slate-600 transition rounded p-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 h-0.5 transition-all duration-75 ease-linear',
          t.type === 'success' && 'bg-emerald-600',
          t.type === 'error' && 'bg-red-600',
          t.type === 'info' && 'bg-sky-600'
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <SingleToast key={t.id} t={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

