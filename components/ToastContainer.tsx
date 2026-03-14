'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '@/hooks/use-toast';

const icons = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  error: <AlertCircle size={18} className="text-red-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const borders = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border border-gray-100 border-l-4 min-w-[260px] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="text-sm text-gray-800 flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
