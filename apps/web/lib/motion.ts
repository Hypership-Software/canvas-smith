/**
 * Motion presets for the Canvasmith marketing site.
 *
 * Tone: confident, settled, precise — short distances, soft spring, never bouncy
 * or playful. Motion should feel like metal being set, not jelly.
 *
 * USAGE: these presets are consumed by Framer Motion (the `motion` package, v11+).
 * Any component that imports them must be a Client Component and import the
 * renderer like so:
 *
 *   'use client';
 *   import { motion } from 'motion/react';
 *   import { fadeUp, stagger } from '@/lib/motion';
 *
 * Always gate animation behind `prefers-reduced-motion` (the global stylesheet
 * also neutralizes transitions/animations as a safety net).
 */

/** Premium "easeOutExpo"-ish settle. Use for most fades/translations. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Soft spring for elements that should arrive with weight (e.g. the hero mockup). */
export const springSoft = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
} as const;

/** Fade + rise. Pair with a `whileInView` / `animate="show"` trigger. */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
} as const;

/** Parent variant that staggers `fadeUp` children by 80ms. */
export const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
} as const;
