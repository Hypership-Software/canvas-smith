import * as React from 'react'

import styles from './container.module.css'

/**
 * Container — centered max-width (1120px) wrapper with fluid side padding.
 * Server Component. The single horizontal-rhythm primitive every section uses.
 */
export interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      {children}
    </div>
  )
}
