'use client';

import * as React from 'react';
import {SidePanel, useSidePanelModel} from '@workday/canvas-kit-react/side-panel';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {Heading} from '@workday/canvas-kit-react/text';
import {useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {xIcon} from '@workday/canvas-system-icons-web';

const overlayStyles = createStyles({
  position: 'fixed',
  insetBlockStart: system.space.zero,
  insetBlockEnd: system.space.zero,
  insetInlineStart: system.space.zero,
  insetInlineEnd: system.space.zero,
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: system.color.bg.overlay,
  zIndex: 1000,
});

const panelStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: system.color.bg.default,
  boxShadow: system.depth[6],
});

const headerStyles = createStyles({
  flexShrink: 0,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: system.space.x4,
  paddingInline: system.space.x6,
  paddingBlock: system.space.x4,
  borderBlockEnd: `1px solid ${cssVar(system.color.border.divider)}`,
});

const titleStyles = createStyles({
  margin: system.space.zero,
  minWidth: 0,
});

const bodyStyles = createStyles({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  paddingInline: system.space.x6,
  paddingBlock: system.space.x6,
});

const actionsStyles = createStyles({
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: system.space.x4,
  paddingInline: system.space.x6,
  paddingBlock: system.space.x4,
  borderBlockStart: `1px solid ${cssVar(system.color.border.divider)}`,
  backgroundColor: system.color.bg.alt.softer,
});

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DetailDrawerProps {
  /** Whether the drawer is visible. When `false`, nothing is rendered. */
  open: boolean;
  /** Called when the drawer requests to close (Escape, scrim click, or close button). */
  onClose: () => void;
  /** Drawer title, shown in the header and used as the accessible name. */
  title: string;
  /** The detail record content. */
  children: React.ReactNode;
  /** Optional action button row pinned to the bottom (e.g. Edit / Delete). */
  actions?: React.ReactNode;
  /** Width of the drawer panel. Defaults to `'28rem'`. */
  width?: number | string;
  /** Accessible label for the close button. Defaults to "Close". */
  closeLabel?: string;
}

/**
 * DetailDrawer — a Canvas SidePanel-based right-anchored drawer that reveals a
 * detail record plus an action row. Adds the modal affordances SidePanel lacks:
 * a dimming scrim, Escape-to-close, initial focus into the panel, a focus trap,
 * and focus return to the previously-focused element on close.
 */
export const DetailDrawer = ({
  open,
  onClose,
  title,
  children,
  actions,
  width = '28rem',
  closeLabel = 'Close',
}: DetailDrawerProps) => {
  const labelId = useUniqueId();
  const panelRef = React.useRef<HTMLElement | null>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);

  const model = useSidePanelModel({
    initialTransitionState: 'expanded',
    origin: 'end',
    // Drives both the panel's `aria-labelledby` and the heading's `id`.
    labelId,
  });

  // Capture the trigger so focus can return to it on close; restore on unmount.
  React.useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      // Move focus into the panel once it mounts.
      const id = window.requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (focusable ?? panel).focus();
      });
      return () => {
        window.cancelAnimationFrame(id);
        returnFocusRef.current?.focus?.();
      };
    }
    return undefined;
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Trap focus within the panel.
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(el => el.offsetParent !== null || el === document.activeElement);
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <Box
      cs={overlayStyles}
      onMouseDown={event => {
        // Close only when the scrim itself (not the panel) is clicked.
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <SidePanel
        ref={panelRef as React.Ref<HTMLElement>}
        model={model}
        variant="alternate"
        expandedWidth={resolvedWidth}
        role="dialog"
        aria-modal
        tabIndex={-1}
        cs={panelStyles}
      >
        <Flex cs={headerStyles}>
          <SidePanel.Heading as="h2" size="small" cs={titleStyles}>
            {title}
          </SidePanel.Heading>
          <TertiaryButton icon={xIcon} aria-label={closeLabel} onClick={onClose} />
        </Flex>

        <Box cs={bodyStyles}>{children}</Box>

        {actions ? <Flex cs={actionsStyles}>{actions}</Flex> : null}
      </SidePanel>
    </Box>
  );
};

export default DetailDrawer;
