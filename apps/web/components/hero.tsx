'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { CommandBlock } from '@/components/command-block'
import { ease, fadeUp, springSoft } from '@/lib/motion'
import styles from './hero.module.css'

/**
 * Hero — R6 §3.2. Client Component (Framer Motion reveal).
 *
 * A dark `--cm-night` band with a faint blueprint-grid texture and one warm
 * `--cm-spark` glow (the only glow — anti-slop). The H1 reveals word-by-word
 * (fadeUp, 60ms stagger); the framed product panel on the right settles up with
 * a soft spring. All motion is gated behind `prefers-reduced-motion`.
 *
 * The install block is the prominent element: two real CommandBlocks carrying
 * the exact plugin-marketplace + install commands.
 */

const H1_WORDS = ['Make', 'it', 'look', 'like', 'Workday', 'built', 'it.'] as const

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
} as const

export function Hero() {
  const reduceMotion = useReducedMotion()

  // 60ms stagger per the brief; collapse to instant when reduced motion is set.
  const wordContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: 0.05 },
    },
  } as const

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <Container className={styles.inner}>
        <div className={styles.copy}>
          <Eyebrow tone="night">Claude plugin for Workday Canvas</Eyebrow>

          <motion.h1
            className={styles.title}
            variants={wordContainer}
            initial="hidden"
            animate="show"
          >
            {H1_WORDS.map((word, i) => (
              <React.Fragment key={`${word}-${i}`}>
                <motion.span className={styles.word} variants={wordVariants}>
                  {word}
                </motion.span>{' '}
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.p
            className={styles.sub}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: reduceMotion ? 0 : 0.5 }}
          >
            Canvasmith is a Claude plugin that grounds every front-end your agent
            builds in real Workday Canvas Kit components and tokens. No more
            generic AI dashboards — ship UI that&apos;s indistinguishable from a
            native Workday product.
          </motion.p>

          <motion.div
            className={styles.install}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: reduceMotion ? 0 : 0.62 }}
          >
            <p className={styles.installLabel}>Add it in one line</p>
            <div className={styles.commands}>
              <CommandBlock
                command="/plugin marketplace add canvasmith/canvasmith"
                variant="primary"
                prompt="/"
              />
              <CommandBlock
                command="/plugin install canvasmith@canvasmith"
                variant="muted"
                prompt="/"
              />
            </div>
            <p className={styles.helper}>
              Works in Claude Code. Requires the Canvas Kit packages in your
              project (we&apos;ll add them).
            </p>
          </motion.div>

          <motion.div
            className={styles.ctas}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: reduceMotion ? 0 : 0.74 }}
          >
            <Button href="#before-after" variant="primary">
              See the before &amp; after
            </Button>
            <Button href="#how-it-works" variant="ghost" className={styles.ghostOnDark}>
              How it works <span aria-hidden="true">↓</span>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className={styles.visual}
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { ...springSoft, delay: 0.3 }}
        >
          <ProductMock />
        </motion.div>
      </Container>
    </section>
  )
}

/**
 * A static, on-brand "after" stand-in: a browser-chrome frame wrapping a
 * Canvas-native worker time-off request screen rendered as plain markup. It is
 * decorative (aria-hidden) — the live, interactive proof lives in BeforeAfter.
 */
function ProductMock() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.chrome}>
        <span className={styles.dots}>
          <span className={styles.dotRed} />
          <span className={styles.dotAmber} />
          <span className={styles.dotGreen} />
        </span>
        <span className={styles.urlbar}>app.workday.example / time-off</span>
        <span className={styles.builtTag}>Built with Canvas Kit</span>
      </div>

      <div className={styles.screen}>
        <div className={styles.appHead}>
          <span className={styles.appAvatar}>AR</span>
          <div className={styles.appHeadText}>
            <span className={styles.appTitle}>Request Time Off</span>
            <span className={styles.appCrumb}>Absence · Worker</span>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Type</span>
          <span className={styles.selectMock}>
            Vacation
            <span className={styles.caret} />
          </span>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <span className={styles.label}>From</span>
            <span className={styles.inputMock}>Jun 8, 2026</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>To</span>
            <span className={styles.inputMock}>Jun 12, 2026</span>
          </div>
        </div>

        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Available balance</span>
          <span className={styles.balanceValue}>14.0 days</span>
        </div>

        <div className={styles.appActions}>
          <span className={styles.btnGhost}>Cancel</span>
          <span className={styles.btnPrimary}>Submit request</span>
        </div>
      </div>
    </div>
  )
}
