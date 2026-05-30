'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { CommandBlock } from '@/components/command-block'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './install-section.module.css'

/**
 * InstallSection — the dark `--cm-night` install band (R6 §3.8). Echoes the hero
 * to bookend the page. Four numbered steps, each with a copyable CommandBlock:
 *   (1) add the plugin marketplace
 *   (2) install the plugin
 *   (3) add the pinned Canvas Kit packages ($ shell prompt)
 *   (4) initialize Canvasmith
 *
 * The exact install commands and pinned npm line are reproduced verbatim. A
 * helper line states the React / @emotion peer requirements, and a ghost
 * "Read the docs" Button closes the section.
 */

interface Step {
  title: string
  command: string
  prompt?: '$' | '/'
  variant?: 'primary' | 'muted'
}

const STEPS: Step[] = [
  {
    title: 'Add the marketplace.',
    command: '/plugin marketplace add canvasmith/canvasmith',
    prompt: '/',
    variant: 'primary',
  },
  {
    title: 'Install the plugin.',
    command: '/plugin install canvasmith@canvasmith',
    prompt: '/',
    variant: 'primary',
  },
  {
    title: 'Add Canvas Kit to your project.',
    command:
      'npm i @workday/canvas-kit-react@15.0.6 @workday/canvas-kit-styling@15.0.6 @workday/canvas-tokens-web@4.3.0 @workday/canvas-system-icons-web@4.0.4 @workday/canvas-kit-react-fonts',
    prompt: '$',
    variant: 'muted',
  },
  {
    title: 'Initialize.',
    command: '/canvasmith:init',
    prompt: '/',
    variant: 'primary',
  },
]

export function InstallSection() {
  const reduceMotion = useReducedMotion()

  return (
    <Section id="install" tone="night" eyebrow="INSTALL">
      <motion.div
        className={styles.head}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <h2 className={styles.title}>Add Canvasmith in under a minute.</h2>
        <p className={styles.sub}>
          Four steps, all copyable. Canvasmith detects your framework
          &mdash; Next.js, Vite, CRA &mdash; automatically.
        </p>
      </motion.div>

      <motion.ol
        className={styles.steps}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        {STEPS.map((step, index) => (
          <motion.li
            key={step.command}
            className={styles.step}
            variants={fadeUp}
          >
            <span className={styles.num} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.stepBody}>
              <p className={styles.stepTitle}>{step.title}</p>
              <CommandBlock
                command={step.command}
                prompt={step.prompt}
                variant={step.variant}
              />
            </div>
          </motion.li>
        ))}
      </motion.ol>

      <div className={styles.footer}>
        <p className={styles.helper}>
          Requires React &ge; 18 and{' '}
          <code className={styles.code}>@emotion/react</code> ^11.7.
        </p>
        <Button
          variant="ghost"
          as="a"
          href="https://github.com/canvasmith/canvasmith"
          className={styles.docsButton}
        >
          Read the docs
        </Button>
      </div>
    </Section>
  )
}
