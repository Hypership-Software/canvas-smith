'use client';

import * as React from 'react';

import {Toast} from '@workday/canvas-kit-react/toast';
import {Box} from '@workday/canvas-kit-react/layout';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {
  checkIcon,
  infoIcon,
  exclamationTriangleIcon,
  exclamationCircleIcon,
  type CanvasSystemIcon,
} from '@workday/canvas-system-icons-web';

import {useToastQueue, type ToastVariant} from '@/registry/canvasmith/hooks/use-toast';

/** Placement of the toast region within the viewport. */
export type ToastCenterPlacement =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

export interface ToastCenterProps {
  /** Where the stack of toasts is anchored. @default 'bottom-end' */
  placement?: ToastCenterPlacement;
}

const variantConfig: Record<ToastVariant, {icon: CanvasSystemIcon; color: string}> = {
  success: {icon: checkIcon, color: system.color.fg.positive.default},
  info: {icon: infoIcon, color: system.color.fg.primary.default},
  caution: {icon: exclamationTriangleIcon, color: system.color.fg.caution.default},
  critical: {icon: exclamationCircleIcon, color: system.color.fg.critical.default},
};

const regionStyles = createStyles({
  position: 'fixed',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x3,
  padding: system.space.x6,
  // Let clicks pass through the gaps between toasts to the page beneath.
  pointerEvents: 'none',
  maxBlockSize: '100vh',
  overflow: 'hidden',
  '& > *': {
    pointerEvents: 'auto',
  },
});

const placementStyles: Record<ToastCenterPlacement, string> = {
  'top-start': createStyles({
    insetBlockStart: 0,
    insetInlineStart: 0,
    alignItems: 'flex-start',
  }),
  'top-end': createStyles({
    insetBlockStart: 0,
    insetInlineEnd: 0,
    alignItems: 'flex-end',
  }),
  'bottom-start': createStyles({
    insetBlockEnd: 0,
    insetInlineStart: 0,
    alignItems: 'flex-start',
    flexDirection: 'column-reverse',
  }),
  'bottom-end': createStyles({
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    alignItems: 'flex-end',
    flexDirection: 'column-reverse',
  }),
};

const toastDepthStyles = createStyles({
  boxShadow: system.depth[5],
});

/**
 * Renders the queued toasts from {@link useToast} in a fixed, viewport-anchored
 * region. Each toast is a Canvas `Toast`: `critical` toasts use `mode="alert"`
 * (assertive `aria-live`) so errors interrupt, while all others use `mode="status"`
 * (polite). The icon + label pairing keeps meaning from being color-only.
 *
 * Render this once, inside a `ToastProvider`, near the application root:
 *
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <ToastCenter placement="bottom-end" />
 * </ToastProvider>
 * ```
 */
export const ToastCenter = ({placement = 'bottom-end'}: ToastCenterProps) => {
  const {toasts, dismiss} = useToastQueue();

  return (
    <Box
      cs={[regionStyles, placementStyles[placement]]}
      // The region itself is a non-interactive container; individual toasts carry
      // their own aria-live semantics via `mode`.
      aria-hidden={toasts.length === 0 ? true : undefined}
    >
      {toasts.map(toast => {
        const {icon, color} = variantConfig[toast.variant];
        const mode = toast.variant === 'critical' ? 'alert' : 'status';

        return (
          <Toast key={toast.id} mode={mode} cs={toastDepthStyles}>
            <Toast.Icon icon={icon} color={color} />
            <Toast.Body>
              <Toast.Message>{toast.message}</Toast.Message>
            </Toast.Body>
            <Toast.CloseIcon
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            />
          </Toast>
        );
      })}
    </Box>
  );
};
