import * as React from 'react'

import { Container } from './container'
import { Eyebrow } from './eyebrow'
import styles from './section.module.css'

/**
 * Section — the vertical-rhythm layout primitive every page section is built on.
 * Server Component.
 *
 * Standardizes: vertical padding (`clamp(4rem, 10vw, 8rem)`), background tone,
 * text color for dark bands, the centered <Container>, and an optional <Eyebrow>.
 */
export interface SectionProps {
  id?: string
  /**
   * paper   — warm off-white page bg (`--cm-paper`), default.
   * paper2  — warm panel bg (`--cm-paper-2`).
   * night   — deep navy band (`--cm-night`) with light text.
   * surface — pure white surface (`--cm-surface`).
   */
  tone?: 'paper' | 'paper2' | 'night' | 'surface'
  eyebrow?: string
  children: React.ReactNode
  className?: string
}

export function Section({
  id,
  tone = 'paper',
  eyebrow,
  children,
  className,
}: SectionProps) {
  const sectionClasses = [styles.section, styles[tone], className]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={sectionClasses}>
      <Container>
        {eyebrow ? (
          <Eyebrow tone={tone === 'night' ? 'night' : 'default'}>{eyebrow}</Eyebrow>
        ) : null}
        {children}
      </Container>
    </section>
  )
}
