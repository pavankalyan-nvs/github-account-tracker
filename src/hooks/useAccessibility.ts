import { useEffect, useRef, useCallback } from 'react';

// Hook for keyboard navigation
export const useKeyboardNavigation = (onEnter?: () => void, onSpace?: () => void, onEscape?: () => void) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case ' ':
          if (onSpace) {
            event.preventDefault();
            onSpace();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onSpace, onEscape]);

  return ref;
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!announceRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'screen-reader-announcer';
      document.body.appendChild(announcer);
      announceRef.current = announcer;
    }

    return () => {
      const existing = document.getElementById('screen-reader-announcer');
      if (existing && existing === announceRef.current) {
        document.body.removeChild(existing);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear the message after announcement to avoid repetition
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
};

// Hook for focus management
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);

  const focusElement = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  const focusFirstChild = useCallback(() => {
    if (focusRef.current) {
      const firstFocusable = focusRef.current.querySelector(
        'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="password"]:not([disabled]), input[type="search"]:not([disabled]), input[type="email"]:not([disabled]), input[type="number"]:not([disabled]), input[type="url"]:not([disabled]), input[type="tel"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, []);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !focusRef.current) return;

    const focusableElements = focusRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="password"]:not([disabled]), input[type="search"]:not([disabled]), input[type="email"]:not([disabled]), input[type="number"]:not([disabled]), input[type="url"]:not([disabled]), input[type="tel"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement?.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement?.focus();
      event.preventDefault();
    }
  }, []);

  return {
    focusRef,
    focusElement,
    focusFirstChild,
    trapFocus
  };
};

// Hook for skip links
export const useSkipLinks = () => {
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView();
    }
  }, []);

  return {
    skipToMain,
    skipToNavigation
  };
};

// Hook for reduced motion preference
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion;
};