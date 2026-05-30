'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './problem-section.module.css'

/**
 * ProblemSection — R6 §3.4. Warm `--cm-paper` band.
 *
 * Names the wedge: every model produces the same off-brand, token-blind UI.
 * Layout is deliberately asymmetric (NOT three identical cards): one wide lead
 * statement spanning the row, two narrower supporting notes beneath it, and a
 * desaturated "AI slop dashboard" stand-in annotated with red pins. Entrance is
 * a `whileInView` fadeUp stagger, gated globally by `prefers-reduced-motion`.
 */

/** Red annotation pins overlaid on the bland slop mock — the "receipts." */
const PINS = [
  { label: 'invented color', top: '18%', left: '8%' },
  { label: 'wrong radius', top: '52%', left: '60%' },
  { label: 'non-token spacing', top: '80%', left: '22%' },
] as const

export function ProblemSection() {
  return (
    <Section id="problem" tone="paper" eyebrow="THE PROBLEM">
      <motion.div
        className={styles.layout}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 className={styles.heading} variants={fadeUp}>
          Every AI builds the same generic UI.
        </motion.h2>

        <motion.p className={styles.lead} variants={fadeUp}>
          Ask any model for a dashboard and you get the same thing: a centered
          hero, a purple gradient, three identical cards, and spacing that&rsquo;s{' '}
          <em>almost</em> right. It&rsquo;s not wrong &mdash; it&rsquo;s just
          nobody&rsquo;s. It looks like AI. And it looks nothing like the Workday
          product it&rsquo;s supposed to live inside.
        </motion.p>

        {/* Asymmetric grid: one wide statement, then two supporting notes, then
            the annotated slop visual occupying its own column on desktop. */}
        <div className={styles.grid}>
          <motion.div
            className={`${styles.point} ${styles.pointWide}`}
            variants={fadeUp}
          >
            <h3 className={styles.pointTitle}>Off-brand by default.</h3>
            <p className={styles.pointBody}>
              Models don&rsquo;t know your blueberry from your blackPepper. They
              guess hex codes, invent spacing, and reach for whatever&rsquo;s in
              their training data.
            </p>
          </motion.div>

          <motion.div className={styles.point} variants={fadeUp}>
            <h3 className={styles.pointTitle}>Tokens ignored.</h3>
            <p className={styles.pointBody}>
              Real Workday UI is built on Canvas tokens and stencils. Generic
              output hard-codes <code className={styles.codeInline}>#3b82f6</code>{' '}
              and <code className={styles.codeInline}>padding: 16px</code> &mdash;
              and instantly reads as not-Workday.
            </p>
          </motion.div>

          <motion.div className={styles.point} variants={fadeUp}>
            <h3 className={styles.pointTitle}>Close, but uncanny.</h3>
            <p className={styles.pointBody}>
              The worst kind of wrong: 90% there. Enough to pass a glance, enough
              to fail a design review.
            </p>
          </motion.div>

          {/* The bland, desaturated "AI slop dashboard" stand-in with red pins. */}
          <motion.figure
            className={styles.slop}
            variants={fadeUp}
            aria-label="A generic, off-brand AI-generated dashboard, annotated with design problems"
          >
            <div className={styles.slopChrome} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>

            <div className={styles.slopBody} aria-hidden="true">
              <div className={styles.slopHeader}>
                <span className={styles.slopLogo} />
                <span className={styles.slopNav}>
                  <i />
                  <i />
                  <i />
                </span>
              </div>

              <div className={styles.slopHero}>
                <span className={styles.slopH1} />
                <span className={styles.slopSub} />
                <span className={styles.slopCta} />
              </div>

              <div className={styles.slopCards}>
                <div className={styles.slopCard}>
                  <span className={styles.slopCardIcon} />
                  <span className={styles.slopCardLine} />
                  <span className={`${styles.slopCardLine} ${styles.short}`} />
                </div>
                <div className={styles.slopCard}>
                  <span className={styles.slopCardIcon} />
                  <span className={styles.slopCardLine} />
                  <span className={`${styles.slopCardLine} ${styles.short}`} />
                </div>
                <div className={styles.slopCard}>
                  <span className={styles.slopCardIcon} />
                  <span className={styles.slopCardLine} />
                  <span className={`${styles.slopCardLine} ${styles.short}`} />
                </div>
              </div>
            </div>

            {PINS.map((pin) => (
              <span
                key={pin.label}
                className={styles.pin}
                style={{ top: pin.top, left: pin.left }}
              >
                <span className={styles.pinDot} aria-hidden="true" />
                <span className={styles.pinLabel}>{pin.label}</span>
              </span>
            ))}

            <figcaption className={styles.slopCaption}>
              Generic by default &mdash; same hero, same cards, same near-miss
              spacing.
            </figcaption>
          </motion.figure>
        </div>
      </motion.div>
    </Section>
  )
}
