import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning';
  onClose: () => void;
}

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60',
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = iconMap[type];

  return (
    <div className="absolute top-4 left-4 right-4 z-[60] animate-slideDown">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${colorMap[type]}`}>
        <Icon size={20} strokeWidth={2} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
