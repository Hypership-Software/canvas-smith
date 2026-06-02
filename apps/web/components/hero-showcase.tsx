'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { TimeOffMock, StatDashboardMock, DataTableMock } from './showcase/mocks'
import styles from './hero-showcase.module.css'

/**
 * HeroShowcase — a browser-framed panel that auto-rotates through three
 * Canvas-native product screens every 3 seconds, crossfading between them.
 * Deterministic initial index (0) keeps SSR and client identical; the timer
 * only starts after mount. Indicator dots double as manual controls, and the
 * whole thing degrades to an instant swap under `prefers-reduced-motion`.
 */

const SHOWCASES = [
  { key: 'time-off', url: 'app.workday.example / time-off', Mock: TimeOffMock },
  { key: 'people', url: 'app.workday.example / people', Mock: StatDashboardMock },
  { key: 'workers', url: 'app.workday.example / workers', Mock: DataTableMock },
] as const

const ROTATE_MS = 3000

export function HeroShowcase() {
  const reduce = useReducedMotion() ?? false
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SHOWCASES.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [paused])

  // `index` is always in-range (set via modulo / dot controls), but
  // noUncheckedIndexedAccess widens the lookup to `| undefined`; fall back to
  // the first slide to keep the type narrowed without changing behavior.
  const active = SHOWCASES[index] ?? SHOWCASES[0]
  const ActiveMock = active.Mock

  return (
    <div
      className={styles.frame}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.chrome}>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dotRed} />
          <span className={styles.dotAmber} />
          <span className={styles.dotGreen} />
        </span>
        <span className={styles.urlbar}>{active.url}</span>
        <span className={styles.builtTag}>Built with Canvas Kit</span>
      </div>

      <div className={styles.stage}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.key}
            className={styles.slide}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActiveMock />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.indicators} role="tablist" aria-label="Showcase screens">
        {SHOWCASES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${s.url.split(' / ')[1]} screen`}
            className={styles.dot}
            data-active={i === index ? 'true' : 'false'}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
