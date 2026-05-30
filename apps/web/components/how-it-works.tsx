'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './how-it-works.module.css'

/**
 * HowItWorks — R6 §3.5. White `surface` tone, three numbered steps.
 *
 * Ground → Build → Verify, laid out horizontally on desktop and connected by a
 * thin `--cm-spark` line that threads through the step numbers; stacked on mobile.
 * Copy is verbatim from R6. Entrance is a `whileInView` fadeUp stagger gated by
 * `prefers-reduced-motion`.
 */

interface Step {
  n: string
  title: string
  body: React.ReactNode
}

const STEPS: Step[] = [
  {
    n: '1',
    title: 'Ground.',
    body: (
      <>
        Canvasmith loads real Canvas Kit references &mdash; components, stencils,
        and the live token map &mdash; straight from{' '}
        <code className={styles.code}>@workday/canvas-kit-react</code>. Your agent
        now knows what &ldquo;Workday-native&rdquo; actually means.
      </>
    ),
  },
  {
    n: '2',
    title: 'Build.',
    body: (
      <>
        Ask for any screen. Canvasmith steers generation toward real components
        (<code className={styles.code}>PrimaryButton</code>,{' '}
        <code className={styles.code}>Card</code>,{' '}
        <code className={styles.code}>FormField</code>&hellip;) and{' '}
        <code className={styles.code}>cssVar(system.color.&hellip;)</code> tokens
        instead of invented CSS.
      </>
    ),
  },
  {
    n: '3',
    title: 'Verify.',
    body: (
      <>
        A built-in check flags off-brand color, non-token spacing, and raw hex
        &mdash; so what ships passes a Canvas design review, not just an eye test.
      </>
    ),
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="surface" eyebrow="HOW IT WORKS">
      <motion.div
        className={styles.layout}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 className={styles.heading} variants={fadeUp}>
          It teaches your agent the Canvas way &mdash; then enforces it.
        </motion.h2>

        <ol className={styles.steps} role="list">
          {/* The connector is decorative; the spark line threads behind the
              numbered markers on desktop only. */}
          <span className={styles.connector} aria-hidden="true" />

          {STEPS.map((step) => (
            <motion.li key={step.n} className={styles.step} variants={fadeUp}>
              <span className={styles.marker} aria-hidden="true">
                {step.n}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </motion.li>
          ))}
        </ol>

        <motion.p className={styles.footer} variants={fadeUp}>
          No design system expertise required. You write the prompt; Canvasmith
          handles the Canvas.
        </motion.p>
      </motion.div>
    </Section>
  )
}
