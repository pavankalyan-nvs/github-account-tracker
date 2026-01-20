import { useCallback } from 'react';
import { useToastContext } from '../contexts/ToastContext';

export const useToast = () => {
  const { addToast } = useToastContext();

  const toast = {
    success: useCallback(
      (message: string, duration?: number) => {
        addToast({ type: 'success', message, duration });
      },
      [addToast]
    ),

    error: useCallback(
      (message: string, duration?: number) => {
        addToast({ type: 'error', message, duration });
      },
      [addToast]
    ),

    warning: useCallback(
      (message: string, duration?: number) => {
        addToast({ type: 'warning', message, duration });
      },
      [addToast]
    ),

    info: useCallback(
      (message: string, duration?: number) => {
        addToast({ type: 'info', message, duration });
      },
      [addToast]
    ),
  };

  return { toast };
};
