'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import styles from './background-paths.module.css'

/**
 * BackgroundPaths — an animated field of flowing SVG contour paths (the
 * shadcn.io "Background Paths" effect), recolored into Workday's sunrise palette
 * for the hero band. Two mirrored groups of 36 stroked cubic-bezier paths drift
 * their dash offset on an infinite linear loop.
 *
 * Determinism: path geometry, widths, opacities, and durations are all derived
 * from the index (no Math.random), so server and client render identically — no
 * hydration mismatch. Motion is fully gated behind `prefers-reduced-motion`
 * (renders a static, still field instead).
 */

function FloatingPaths({
  position,
  reduce,
}: {
  position: number
  reduce: boolean
}) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d:
      `M-${380 - i * 5 * position} -${189 + i * 6}` +
      `C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}` +
      `C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.6 + i * 0.04,
  }))

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 696 316"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeOpacity={0.12 + path.id * 0.022}
          initial={{ pathLength: 0.35, opacity: reduce ? 0.5 : 0.6 }}
          animate={
            reduce
              ? { pathLength: 1, opacity: 0.5 }
              : { pathLength: 1, opacity: [0.25, 0.65, 0.25], pathOffset: [0, 1, 0] }
          }
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: 18 + (path.id % 12),
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        />
      ))}
    </svg>
  )
}

export function BackgroundPaths() {
  const reduce = useReducedMotion() ?? false
  return (
    <div className={styles.root} aria-hidden="true">
      <span className={styles.sunrise}>
        <FloatingPaths position={1} reduce={reduce} />
      </span>
      <span className={styles.gold}>
        <FloatingPaths position={-1} reduce={reduce} />
      </span>
    </div>
  )
}
