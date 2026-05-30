'use client'

import * as React from 'react'

import { CopyButton } from './copy-button'
import styles from './command-block.module.css'

/**
 * CommandBlock — a copyable monospace command line.
 *
 * Renders the `prompt` glyph (`$` shell or `/` Claude slash-command), the command
 * in `--cm-font-mono`, and a right-aligned CopyButton. The `primary` variant gets
 * a `--cm-blue` left border for emphasis; `muted` is subdued. Reused across the
 * hero, install steps, and final CTA.
 */
export interface CommandBlockProps {
  command: string
  variant?: 'primary' | 'muted'
  prompt?: '$' | '/'
}

export function CommandBlock({
  command,
  variant = 'primary',
  prompt = '/',
}: CommandBlockProps) {
  return (
    <div className={`${styles.block} ${styles[variant]}`}>
      <code className={styles.code}>
        <span className={styles.prompt} aria-hidden="true">
          {prompt}
        </span>
        <span className={styles.command}>{command}</span>
      </code>
      <div className={styles.action}>
        <CopyButton value={command} />
      </div>
    </div>
  )
}
