'use client';

import * as React from 'react';

/** Semantic tone of a toast, mapped to a Canvas status color + icon. */
export type ToastVariant = 'success' | 'info' | 'caution' | 'critical';

/** Options accepted by `showToast`. */
export interface ShowToastOptions {
  /** Visual + semantic tone. @default 'info' */
  variant?: ToastVariant;
  /** The message body. */
  message: React.ReactNode;
  /**
   * Auto-dismiss delay in milliseconds. Pass `0` to keep the toast until it is
   * dismissed manually. `'critical'` toasts default to persistent so errors are not
   * missed.
   * @default 6000 (0 for 'critical')
   */
  duration?: number;
}

/** A queued toast with its generated id and resolved variant. */
export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: React.ReactNode;
  duration: number;
}

/** The imperative API returned by {@link useToast}. */
export interface ToastApi {
  /** Enqueue a toast and return its id (useful for manual dismissal). */
  showToast: (options: ShowToastOptions) => string;
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
  /** Dismiss every active toast. */
  dismissAll: () => void;
}

interface ToastContextValue extends ToastApi {
  toasts: ToastItem[];
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;

let counter = 0;
function nextId(): string {
  counter += 1;
  return `cnvs-toast-${counter}`;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /**
   * Maximum number of toasts shown at once. When exceeded, the oldest toast is
   * dropped. @default 4
   */
  max?: number;
}

/**
 * Provides the toast queue to the tree. Pair with `<ToastCenter />` (rendered once
 * near the root) to display the queued toasts, and call {@link useToast} anywhere
 * below this provider to enqueue them.
 *
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <ToastCenter />
 * </ToastProvider>
 * ```
 */
export const ToastProvider = ({children, max = 4}: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const clearTimer = React.useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = React.useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts(prev => prev.filter(t => t.id !== id));
    },
    [clearTimer]
  );

  const dismissAll = React.useCallback(() => {
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  const showToast = React.useCallback(
    ({variant = 'info', message, duration}: ShowToastOptions) => {
      const id = nextId();
      const resolvedDuration =
        duration ?? (variant === 'critical' ? 0 : DEFAULT_DURATION);
      const item: ToastItem = {id, variant, message, duration: resolvedDuration};

      setToasts(prev => {
        const next = [...prev, item];
        // Drop the oldest toasts (and their timers) beyond the cap.
        while (next.length > max) {
          const removed = next.shift();
          if (removed) {
            clearTimer(removed.id);
          }
        }
        return next;
      });

      if (resolvedDuration > 0) {
        const timer = setTimeout(() => dismiss(id), resolvedDuration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [clearTimer, dismiss, max]
  );

  // Clear all pending timers on unmount.
  React.useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(timer => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({toasts, showToast, dismiss, dismissAll}),
    [toasts, showToast, dismiss, dismissAll]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

/**
 * Access the toast queue. Must be called within a {@link ToastProvider}.
 *
 * ```tsx
 * const {showToast} = useToast();
 * showToast({variant: 'success', message: 'Workbook saved.'});
 * ```
 */
export function useToast(): ToastApi {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  const {showToast, dismiss, dismissAll} = context;
  return {showToast, dismiss, dismissAll};
}

/**
 * Internal accessor used by `<ToastCenter />` to read the live queue. Throws if used
 * outside a {@link ToastProvider}.
 */
export function useToastQueue(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastQueue must be used within a <ToastProvider>.');
  }
  return context;
}
