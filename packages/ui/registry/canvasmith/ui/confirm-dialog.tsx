'use client';

import * as React from 'react';

import {Modal, useModalModel} from '@workday/canvas-kit-react/modal';
import {PrimaryButton, DeleteButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {BodyText} from '@workday/canvas-kit-react/text';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/**
 * Visual + behavioral configuration for a single confirmation.
 *
 * Used both as the public argument to `useConfirmDialog().confirm(...)` and as the
 * controlled props of the standalone {@link ConfirmDialog} component.
 */
export interface ConfirmDialogOptions {
  /** Dialog title rendered as the accessible name (`aria-labelledby`). */
  title: string;
  /** Body copy explaining the consequence of confirming. */
  body: React.ReactNode;
  /** Label for the confirming action button. @default 'Confirm' */
  confirmLabel?: string;
  /** Label for the cancelling action button. @default 'Cancel' */
  cancelLabel?: string;
  /**
   * Treat the action as destructive — renders the confirm button as a red
   * `DeleteButton` instead of a `PrimaryButton`.
   * @default false
   */
  destructive?: boolean;
}

export interface ConfirmDialogProps extends ConfirmDialogOptions {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the user confirms the action. */
  onConfirm: () => void;
  /** Called when the user cancels, presses Escape, or clicks the overlay. */
  onCancel: () => void;
}

const bodyStyles = createStyles({
  margin: 0,
  color: system.color.fg.muted.default,
});

const actionsStyles = createStyles({
  gap: system.gap.md,
  marginBlockStart: system.space.x6,
  paddingBlockEnd: system.space.x2,
});

/**
 * A focus-trapping confirmation dialog built on the Canvas `Modal`. The Canvas popup
 * model (`useModalModel`) supplies the focus trap, return-focus, close-on-Escape,
 * close-on-overlay-click, and assistive sibling-hiding behaviors automatically.
 *
 * This is a fully controlled component: drive `open` and respond to `onConfirm` /
 * `onCancel`. For an imperative, promise-based API prefer {@link useConfirmDialog}.
 *
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 *
 * <ConfirmDialog
 *   open={open}
 *   title="Delete workbook?"
 *   body="This action cannot be undone."
 *   destructive
 *   confirmLabel="Delete"
 *   onConfirm={() => { remove(); setOpen(false); }}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 */
export const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const model = useModalModel();

  // Drive the Canvas popup model from the controlled `open` prop.
  React.useEffect(() => {
    if (open && model.state.visibility === 'hidden') {
      model.events.show();
    } else if (!open && model.state.visibility !== 'hidden') {
      model.events.hide();
    }
    // We intentionally only react to `open`; the model's events are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When the model hides for any reason (Escape, overlay click, close icon),
  // notify the consumer so external `open` state stays in sync.
  const onCancelRef = React.useRef(onCancel);
  onCancelRef.current = onCancel;
  React.useEffect(() => {
    if (open && model.state.visibility === 'hidden') {
      onCancelRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.state.visibility]);

  const ConfirmButton = destructive ? DeleteButton : PrimaryButton;

  return (
    <Modal model={model}>
      <Modal.Overlay>
        <Modal.Card>
          <Modal.CloseIcon aria-label="Close" />
          <Modal.Heading>{title}</Modal.Heading>
          <Modal.Body>
            <BodyText as="p" size="small" cs={bodyStyles}>
              {body}
            </BodyText>
          </Modal.Body>
          <Flex cs={actionsStyles}>
            <Modal.CloseButton as={ConfirmButton} onClick={onConfirm}>
              {confirmLabel}
            </Modal.CloseButton>
            <Modal.CloseButton as={SecondaryButton} onClick={onCancel}>
              {cancelLabel}
            </Modal.CloseButton>
          </Flex>
        </Modal.Card>
      </Modal.Overlay>
    </Modal>
  );
};

/**
 * Internal wrapper used by {@link useConfirmDialog} to render a `ConfirmDialog` from a
 * single state object without re-mounting the model between calls.
 */
export const ConfirmDialogHost = ({
  state,
  onConfirm,
  onCancel,
}: {
  state: (ConfirmDialogOptions & {open: boolean}) | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!state) {
    return null;
  }

  return (
    <Box>
      <ConfirmDialog
        open={state.open}
        title={state.title}
        body={state.body}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        destructive={state.destructive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </Box>
  );
};
