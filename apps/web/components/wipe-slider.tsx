'use client'

import * as React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './wipe-slider.module.css'

/**
 * WipeSlider — the page's signature interaction.
 *
 * Two stacked layers (`before` underneath, `after` on top) with a draggable
 * vertical divider that "wipes" between them via a clip on the top layer. Drag
 * with a pointer anywhere on the surface, or focus the handle and use the arrow
 * keys (Home/End jump to the extremes). The handle is the `--cm-spark` accent.
 *
 * Accessibility: the handle is a `role="slider"` with `aria-valuemin/now/max`
 * and a descriptive label, so screen-reader and keyboard users can reveal either
 * side. State is a controlled percentage (0 = fully "before", 100 = fully
 * "after") — no animation library, so it is inherently reduced-motion safe; the
 * only transition is gated by the global `prefers-reduced-motion` reset.
 */
export interface WipeSliderProps {
  before: React.ReactNode
  after: React.ReactNode
  /** Accessible name for the divider handle. */
  label?: string
}

const MIN = 0
const MAX = 100
const STEP = 4
const STEP_LARGE = 12

function clamp(value: number) {
  return Math.min(MAX, Math.max(MIN, value))
}

export function WipeSlider({
  before,
  after,
  label = 'Reveal the before and after',
}: WipeSliderProps) {
  // 62% default reveal — the "after" leads, but the slop edge is clearly visible.
  const [percent, setPercent] = useState(62)
  const [dragging, setDragging] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)
  const labelId = useId()

  const setFromClientX = useCallback((clientX: number) => {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = (clientX - rect.left) / rect.width
    setPercent(clamp(Math.round(ratio * 100)))
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Ignore secondary buttons; let the surface own the gesture.
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
      setFromClientX(event.clientX)
      handleRef.current?.focus()
    },
    [setFromClientX],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return
      setFromClientX(event.clientX)
    },
    [dragging, setFromClientX],
  )

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      setDragging(false)
    },
    [],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      let next: number | null = null
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = percent - STEP
          break
        case 'ArrowRight':
        case 'ArrowUp':
          next = percent + STEP
          break
        case 'PageDown':
          next = percent - STEP_LARGE
          break
        case 'PageUp':
          next = percent + STEP_LARGE
          break
        case 'Home':
          next = MIN
          break
        case 'End':
          next = MAX
          break
        default:
          return
      }
      event.preventDefault()
      setPercent(clamp(next))
    },
    [percent],
  )

  // Release the drag flag if the pointer is lifted outside the surface.
  useEffect(() => {
    if (!dragging) return
    const stop = () => setDragging(false)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [dragging])

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${dragging ? styles.dragging : ''}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ ['--wipe' as string]: `${percent}%` }}
    >
      {/* BEFORE — the base layer, always fully painted underneath. */}
      <div className={styles.layer} aria-hidden={percent >= 100}>
        <span className={styles.cornerTag} data-side="before">
          Before
        </span>
        <div className={styles.content}>{before}</div>
      </div>

      {/* AFTER — clipped from the left edge to the divider. */}
      <div className={`${styles.layer} ${styles.after}`} aria-hidden={percent <= 0}>
        <span className={styles.cornerTag} data-side="after">
          After · Canvasmithed
        </span>
        <div className={styles.content}>{after}</div>
      </div>

      {/* Divider + handle. */}
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
      </div>

      <span id={labelId} className={styles.srOnly}>
        {label}
      </span>
      <button
        ref={handleRef}
        type="button"
        className={styles.handle}
        role="slider"
        aria-labelledby={labelId}
        aria-orientation="horizontal"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% Canvas-native`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className={styles.handleGrip} aria-hidden="true">
          <ChevronPair />
        </span>
      </button>
    </div>
  )
}

function ChevronPair() {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 22 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2 2 7l5 5" />
      <path d="M15 2l5 5-5 5" />
    </svg>
  )
}
