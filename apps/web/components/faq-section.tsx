'use client'

import * as React from 'react'
import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useReducedMotion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ease } from '@/lib/motion'
import styles from './faq-section.module.css'

/**
 * FAQSection — warm `--cm-paper` band with an accessible single-open accordion.
 *
 * Accessibility:
 *   - Each row is a native <button> with `aria-expanded` + `aria-controls`,
 *     paired to a `region` panel labelled by the button (the WAI-ARIA disclosure
 *     pattern). Only one panel is open at a time.
 *   - The panel height animates (framer) but is gated behind `prefers-reduced-motion`
 *     via `useReducedMotion`, and the global stylesheet neutralizes transitions too.
 *   - The same item list seeds an FAQPage JSON-LD block for rich results.
 */

interface FaqItem {
  q: string
  a: string
}

// Verbatim from R6 §3.9.
const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is this an official Workday product?',
    a: 'No. Canvasmith is an independent, community plugin. It uses the publicly published, open-source @workday/canvas-kit packages. It is not affiliated with or endorsed by Workday, Inc.',
  },
  {
    q: 'Do I need to know Canvas Kit already?',
    a: 'No. That’s the point — Canvasmith brings the Canvas knowledge so you can prompt in plain language and still get token-correct, component-correct UI.',
  },
  {
    q: 'What does it actually change in my code?',
    a: 'It writes real @workday/canvas-kit-react components and cssVar(system.*) tokens, scaffolds stencils with createStencil, and replaces invented CSS with Canvas equivalents.',
  },
  {
    q: 'Will it work with my existing app?',
    a: 'Yes. /canvasmith:convert refactors existing screens; /canvasmith:audit flags drift. It works alongside your current components.',
  },
  {
    q: 'Which models / tools?',
    a: 'Canvasmith is a Claude Code plugin. Install via the plugin marketplace (see Install).',
  },
  {
    q: 'Is it free?',
    a: 'Yes — the plugin is free and open source. You bring your own Claude access.',
  },
  {
    q: 'Does it support theming / white-label brands?',
    a: 'Yes. Canvas theming is driven by brand tokens (brand.action.base/.accent/.lightest). Run /canvasmith:init to capture your tenant’s brand in CANVAS.md, and Canvasmith builds against those brand tokens — so output matches your branding, not just default blueberry.',
  },
]

// FAQPage structured data, built from the same source of truth.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()
  const baseId = useId()

  return (
    <Section id="faq" tone="paper">
      <div className={styles.layout}>
        <div className={styles.intro}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className={styles.heading}>Questions, answered.</h2>
          <p className={styles.introSub}>
            Everything about what Canvasmith changes, what it needs, and how it
            stays Workday-native.
          </p>
        </div>

        <ul role="list" className={styles.list}>
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index
          const buttonId = `${baseId}-faq-button-${index}`
          const panelId = `${baseId}-faq-panel-${index}`

          return (
            <li key={item.q} className={styles.item}>
              <h3 className={styles.questionWrap}>
                <button
                  type="button"
                  id={buttonId}
                  className={styles.question}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={styles.questionText}>{item.q}</span>
                  <span
                    className={`${styles.indicator} ${isOpen ? styles.indicatorOpen : ''}`.trim()}
                    aria-hidden="true"
                  >
                    <PlusIcon />
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={styles.panel}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease }}
                  >
                    <p className={styles.answer}>{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          )
        })}
        </ul>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </Section>
  )
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M9 3.5V14.5" className={styles.indicatorVertical} />
      <path d="M3.5 9H14.5" />
    </svg>
  )
}
