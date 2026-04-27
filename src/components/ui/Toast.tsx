import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  open: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
  onClose: () => void;
};

const iconMap = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const toneMap = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-gray-300 bg-white text-black',
};

export default function Toast({
  open,
  type = 'info',
  title,
  message,
  durationMs = 4500,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onClose]);

  const Icon = iconMap[type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-5 right-5 z-[120] w-[min(92vw,380px)] rounded-2xl border shadow-2xl ${toneMap[type]}`}
          role="status"
          aria-live="polite"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{title}</p>
                {message ? <p className="mt-1 text-xs opacity-90">{message}</p> : null}
              </div>
              <button
                onClick={onClose}
                className="text-[11px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
                aria-label="Close notification"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
