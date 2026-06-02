'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'

import { Section } from '@/components/ui/section'
import { TimeOffMock } from '@/components/showcase/mocks'
import { fadeUp } from '@/lib/motion'
import { WipeSlider } from './wipe-slider'
import styles from './before-after.module.css'

/**
 * BeforeAfter — the page's signature section (R6 §3.7).
 *
 * Renders the same "worker time-off request" form twice inside a <WipeSlider>:
 *   LEFT  (before) — deliberately generic "AI slop": plain HTML + inline styles,
 *                    the wrong blue (#3b82f6), an Inter-ish stack, mismatched
 *                    radii, and an emoji icon. No design system in sight.
 *   RIGHT (after)  — the SAME form built from REAL Canvas Kit components. It is
 *                    loaded CLIENT-ONLY (next/dynamic, ssr:false) behind a mount
 *                    gate, with a token-styled placeholder, so Canvas Kit's
 *                    per-process style hashes never cause a hydration mismatch.
 *
 * Below the slider sits the "receipts" diff row — the three concrete swaps that
 * make the after Canvas-native.
 */

const TIME_OFF_TYPES = ['Vacation', 'Sick', 'Personal', 'Bereavement', 'Jury duty']

// Client-only Canvas Kit "after" screen. Placeholder matches the SSR markup.
const AfterCanvas = dynamic(() => import('./before-after-canvas'), {
  ssr: false,
  loading: () => <TimeOffMock />,
})

export function BeforeAfter() {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  // Intentional one-shot hydration gate: render the client-only Canvas "after"
  // screen only after mount so SSR markup matches. The set-state-in-effect rule
  // (new in eslint-config-next 16) flags this deliberate pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <Section id="before-after" tone="surface" eyebrow="BEFORE / AFTER">
      <motion.div
        className={styles.head}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <h2 className={styles.title}>
          The same prompt. A completely different product.
        </h2>
        <p className={styles.sub}>
          <span className={styles.prompt}>
            &ldquo;Build a worker time-off request screen.&rdquo;
          </span>{' '}
          Left: a generic model&rsquo;s first try. Right: the same screen,
          Canvasmithed. Drag the handle &mdash; or use the arrow keys &mdash; to
          wipe between them.
        </p>
      </motion.div>

      <div className={styles.stage}>
        <WipeSlider
          label="Wipe between the generic AI version and the Canvas-native version of the time-off request screen"
          before={<BeforeForm />}
          after={mounted ? <AfterCanvas /> : <TimeOffMock />}
        />
      </div>

      {/* The receipts — three concrete diffs that earn the "after". */}
      <ul className={styles.receipts} aria-label="What Canvasmith changed">
        {RECEIPTS.map((receipt) => (
          <li key={receipt.label} className={styles.receipt}>
            <span className={styles.receiptLabel}>{receipt.label}</span>
            <span className={styles.receiptDiff}>
              <code className={styles.before}>{receipt.before}</code>
              <span className={styles.arrow} aria-hidden="true">
                &rarr;
              </span>
              <code className={styles.after}>{receipt.after}</code>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

const RECEIPTS: { label: string; before: string; after: string }[] = [
  { label: 'Color', before: '#3b82f6', after: 'cssVar(system.color.bg.primary.default)' },
  { label: 'Button', before: '<button className="btn">', after: '<PrimaryButton size="medium">' },
  { label: 'Spacing', before: 'padding: 18px', after: 'system.space.x4 (1rem)' },
]

/* ===========================================================================
   BEFORE — generic "AI slop". Plain HTML + inline styles ONLY. No tokens, no
   Canvas Kit, wrong blue (#3b82f6), an Inter-ish system stack, a 6px radius,
   an emoji icon, and an off-rhythm 18px padding. This is the anti-pattern.
   =========================================================================== */
function BeforeForm() {
  const wrap: React.CSSProperties = {
    fontFamily: "Inter, -apple-system, 'Segoe UI', Roboto, system-ui, sans-serif",
    background: '#f9fafb',
    color: '#111827',
    height: '100%',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'auto',
    boxSizing: 'border-box',
  }
  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '18px',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 11px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginBottom: '14px',
    background: '#ffffff',
    color: '#111827',
    boxSizing: 'border-box',
  }
  const btnPrimary: React.CSSProperties = {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  }
  const btnSecondary: React.CSSProperties = {
    background: '#ffffff',
    color: '#3b82f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '10px',
  }

  return (
    <div style={wrap}>
      <div style={cardStyle}>
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span aria-hidden="true">📅</span> Request Time Off
        </h3>

        <label style={labelStyle}>Employee Name</label>
        <input style={inputStyle} placeholder="Jane Doe" defaultValue="" />

        <label style={labelStyle}>Type</label>
        <select style={inputStyle} defaultValue="Vacation">
          {TIME_OFF_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <label style={labelStyle}>Start Date</label>
        <input style={inputStyle} type="date" />

        <label style={labelStyle}>End Date</label>
        <input style={inputStyle} type="date" />

        <div style={{ marginTop: '4px' }}>
          <button type="button" style={btnSecondary}>
            Cancel
          </button>
          <button type="button" style={btnPrimary}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}
