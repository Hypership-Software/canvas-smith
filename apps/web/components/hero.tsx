'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { CommandBlock } from '@/components/command-block'
import { BackgroundPaths } from '@/components/background-paths'
import { HeroShowcase } from '@/components/hero-showcase'
import { ease, fadeUp, springSoft } from '@/lib/motion'
import styles from './hero.module.css'

/**
 * Hero — R6 §3.2. Client Component (Framer Motion reveal).
 *
 * A deep Workday-blue daylight band textured with the animated "Background
 * Paths" sunrise field (components/background-paths.tsx). The H1 reveals
 * word-by-word (fadeUp, 60ms stagger); the framed showcase on the right
 * auto-rotates through three Canvas-native product screens. All motion is gated
 * behind `prefers-reduced-motion`.
 *
 * The install affordance is a single, copyable one-line `npx` command.
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
    <section id="top" className={`${styles.hero} on-night`}>
      <BackgroundPaths />

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
            <CommandBlock command="npx canvasmith@latest" variant="primary" prompt="$" />
            <p className={styles.helper}>
              Detects your framework and wires in the pinned Canvas Kit packages
              automatically.
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
          <HeroShowcase />
        </motion.div>
      </Container>
    </section>
  )
}
