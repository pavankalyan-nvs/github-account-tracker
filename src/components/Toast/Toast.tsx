import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-accent-green/10',
    border: 'border-accent-green',
    text: 'text-accent-green-light',
    icon: 'text-accent-green',
  },
  error: {
    bg: 'bg-accent-red/10',
    border: 'border-accent-red',
    text: 'text-accent-red-light',
    icon: 'text-accent-red',
  },
  warning: {
    bg: 'bg-accent-yellow/10',
    border: 'border-accent-yellow',
    text: 'text-accent-yellow-light',
    icon: 'text-accent-yellow',
  },
  info: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue',
    text: 'text-accent-blue-light',
    icon: 'text-accent-blue',
  },
};

const ariaLiveMap = {
  success: 'polite' as const,
  error: 'assertive' as const,
  warning: 'assertive' as const,
  info: 'polite' as const,
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];
  const ariaLive = ariaLiveMap[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match toast-out animation duration
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      aria-live={ariaLive}
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        ${colors.bg} ${colors.border} ${colors.text}
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
        shadow-lg min-w-[320px] max-w-md
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${colors.icon}`} aria-hidden="true" />

      <div className="flex-1 text-sm font-medium text-dark-text-primary">
        {toast.message}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-dark-text-tertiary hover:text-dark-text-primary transition-colors duration-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
