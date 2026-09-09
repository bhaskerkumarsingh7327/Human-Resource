import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const config = {
    success: {
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M4 10.5L8 14.5L16 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-emerald-500',
      bar: 'bg-emerald-500',
    },
    error: {
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-red-500',
      bar: 'bg-red-500',
    },
    info: {
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="10" cy="10" r="1" fill="currentColor" />
          <path d="M10 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-indigo-500',
      bar: 'bg-indigo-500',
    },
  }[toast.type];

  return (
    <div
      className="pointer-events-auto relative w-[320px] bg-white/85 backdrop-blur-2xl border border-white/60
                 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden
                 animate-in slide-in-from-bottom-3 fade-in duration-300"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`w-6 h-6 rounded-full ${config.iconBg} text-white flex items-center justify-center shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <p className="text-sm text-slate-700 font-medium leading-snug flex-1 pt-0.5">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-slate-300 hover:text-slate-500 transition shrink-0 -mt-0.5 -mr-1 w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>
      <div className="h-0.5 bg-slate-100">
        <div
          className={`h-full ${config.bar} transition-all duration-[30ms] ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}