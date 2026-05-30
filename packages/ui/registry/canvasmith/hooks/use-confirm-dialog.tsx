'use client';

import * as React from 'react';

import {
  ConfirmDialogHost,
  type ConfirmDialogOptions,
} from '@/registry/canvasmith/ui/confirm-dialog';

/**
 * The imperative API returned by {@link useConfirmDialog}.
 */
export interface ConfirmDialogApi {
  /**
   * Open a confirmation dialog and resolve with the user's decision.
   *
   * Resolves `true` when the confirm button is pressed and `false` when the user
   * cancels (Cancel button, close icon, Escape, or overlay click).
   *
   * ```tsx
   * const {confirm, dialog} = useConfirmDialog();
   *
   * async function onDelete() {
   *   const ok = await confirm({
   *     title: 'Delete workbook?',
   *     body: 'This action cannot be undone.',
   *     confirmLabel: 'Delete',
   *     destructive: true,
   *   });
   *   if (ok) {
   *     // proceed with deletion
   *   }
   * }
   *
   * return (
   *   <>
   *     <DeleteButton onClick={onDelete}>Delete</DeleteButton>
   *     {dialog}
   *   </>
   * );
   * ```
   */
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  /**
   * The rendered dialog element. Place this once anywhere in your tree (it renders
   * into a portal via the Canvas `Modal`, so its position in the tree does not affect
   * layout).
   */
  dialog: React.ReactElement;
}

type DialogState = (ConfirmDialogOptions & {open: boolean}) | null;

/**
 * A promise-based confirmation hook. Call `confirm(options)` to imperatively open a
 * Canvas `Modal`-backed dialog; it resolves `true` if the user confirms and `false`
 * otherwise. Render the returned `dialog` element once in your component tree.
 *
 * Focus trapping, return focus, Escape-to-close, and overlay-click-to-close are all
 * provided by the underlying Canvas popup model — this hook only manages the queue of
 * a single pending decision and bridges it to a promise.
 */
export function useConfirmDialog(): ConfirmDialogApi {
  const [state, setState] = React.useState<DialogState>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const settle = React.useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    // Animate the dialog closed, then unmount it on the next tick.
    setState(prev => (prev ? {...prev, open: false} : prev));
  }, []);

  const confirm = React.useCallback((options: ConfirmDialogOptions) => {
    // If a dialog is already open, resolve the previous one as cancelled.
    resolverRef.current?.(false);

    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setState({...options, open: true});
    });
  }, []);

  const handleConfirm = React.useCallback(() => settle(true), [settle]);
  const handleCancel = React.useCallback(() => settle(false), [settle]);

  // Once closed, clear the state so a fresh dialog mounts cleanly next time.
  React.useEffect(() => {
    if (state && !state.open) {
      const id = window.setTimeout(() => setState(null), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state]);

  const dialog = (
    <ConfirmDialogHost state={state} onConfirm={handleConfirm} onCancel={handleCancel} />
  );

  return {confirm, dialog};
}
