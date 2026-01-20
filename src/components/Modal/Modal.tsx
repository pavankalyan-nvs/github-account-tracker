import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useFocusManagement } from '../../hooks/useAccessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: 'confirm' | 'alert' | 'info';
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  onConfirm?: () => void | Promise<void>;
  children?: React.ReactNode;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
}

const variantIcons = {
  confirm: AlertTriangle,
  alert: AlertTriangle,
  info: Info,
};

const variantColors = {
  confirm: {
    icon: 'text-accent-yellow',
    bg: 'bg-accent-yellow/10',
  },
  alert: {
    icon: 'text-accent-red',
    bg: 'bg-accent-red/10',
  },
  info: {
    icon: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
  },
};

const confirmButtonVariants = {
  primary: 'bg-accent-blue hover:bg-accent-blue-hover text-white',
  danger: 'bg-accent-red hover:bg-accent-red-hover text-white',
  success: 'bg-accent-green hover:bg-accent-green-hover text-white',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  children,
  closeOnClickOutside = true,
  showCloseButton = true,
}) => {
  const { focusRef, trapFocus, focusFirstChild } = useFocusManagement();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);

  const Icon = variantIcons[variant];
  const colors = variantColors[variant];

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the first focusable element in the modal
      setTimeout(() => {
        focusFirstChild();
      }, 100);

      // Add event listener for focus trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        trapFocus(e);
      };

      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        // Return focus to the previously focused element
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, trapFocus, focusFirstChild, onClose]);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsConfirming(true);
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        console.error('Error during confirmation:', error);
      } finally {
        setIsConfirming(false);
      }
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={focusRef as React.RefObject<HTMLDivElement>}
        className="relative w-full max-w-md bg-dark-bg-secondary border border-dark-border-primary rounded-lg shadow-card-hover animate-scale-in"
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-dark-text-tertiary hover:text-dark-text-primary transition-colors duration-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} mb-4`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} aria-hidden="true" />
          </div>

          {/* Title */}
          <h2
            id="modal-title"
            className="text-xl font-semibold text-dark-text-primary mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              id="modal-description"
              className="text-sm text-dark-text-secondary mb-6"
            >
              {description}
            </p>
          )}

          {/* Custom Children */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {onConfirm && (
              <>
                <button
                  onClick={onClose}
                  disabled={isConfirming}
                  className="px-4 py-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary bg-dark-bg-tertiary hover:bg-dark-border-primary rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${confirmButtonVariants[confirmVariant]} focus:ring-accent-blue`}
                >
                  {isConfirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </>
            )}
            {!onConfirm && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-accent-blue hover:bg-accent-blue-hover text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue active:scale-95"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
