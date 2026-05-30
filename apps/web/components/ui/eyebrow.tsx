import * as React from 'react'

import styles from './eyebrow.module.css'

/**
 * Eyebrow — small uppercase caption that labels a section.
 * Server Component. `tone` shifts the color for use over light vs. dark bands.
 */
export interface EyebrowProps {
  children: React.ReactNode
  /**
   * `default` — muted blue for light bands.
   * `spark` — warm accent for emphasis.
   * `night` — bright blue, legible over dark `--cm-night` bands.
   */
  tone?: 'default' | 'spark' | 'night'
  className?: string
}

export function Eyebrow({ children, tone = 'default', className }: EyebrowProps) {
  const classes = [styles.eyebrow, styles[tone], className].filter(Boolean).join(' ')
  return <p className={classes}>{children}</p>
}
