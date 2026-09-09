import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      <div
        className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60
                   rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {danger ? (
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path
                  d="M10 6.5V10.5M10 13.5H10.01M4.5 17H15.5C16.6 17 17.3 15.8 16.8 14.8L11.3 3.9C10.7 2.7 9.3 2.7 8.7 3.9L3.2 14.8C2.7 15.8 3.4 17 4.5 17Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 9V14M10 6.5V6.51" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg ${
              danger
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/25'
                : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-indigo-500/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper hook so any page can trigger it with minimal boilerplate
import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger: boolean;
    resolve?: (value: boolean) => void;
  }>({ open: false, title: '', message: '', danger: false });

  const confirm = useCallback((title: string, message: string, danger = false): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, danger, resolve });
    });
  }, []);

  function handleConfirm() {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  }

  function handleCancel() {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  }

  const dialog: ReactNode = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      danger={state.danger}
      confirmLabel={state.danger ? 'Remove' : 'Confirm'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}