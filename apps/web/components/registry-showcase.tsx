'use client'

import * as React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { CommandBlock } from '@/components/command-block'
import { CopyButton } from '@/components/copy-button'
import { BLOCK_PREVIEWS } from '@/components/showcase/mocks'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './registry-showcase.module.css'

/**
 * RegistryShowcase — "What you can drop in" (R6 narrative). Surfaces the
 * Canvasmith registry as a catalog of the canonical 14 blocks. Each card is a
 * button that opens an accessible preview modal rendering a Canvas-native mock
 * of that block plus its copyable install commands.
 *
 * The marketing layer stays CSS-Modules + `--cm-*` only (no Tailwind, no Canvas
 * Kit); the previews are token-styled stand-ins (see showcase/mocks.tsx).
 */

type Tone = 'blue' | 'neutral' | 'spark' | 'muted'

interface Block {
  name: string
  composes: string
  category: string
  tone: Tone
}

const BLOCKS: Block[] = [
  { name: 'stat-card', composes: 'Card + type tokens + trend StatusIndicator / delta.', category: 'display', tone: 'blue' },
  { name: 'empty-state', composes: 'SystemIcon + Heading + BodyText + primary CTA.', category: 'display', tone: 'blue' },
  { name: 'page-header', composes: 'Breadcrumbs + Heading + action button cluster.', category: 'display', tone: 'blue' },
  { name: 'settings-form', composes: 'FormField groups + TextInput / Select / Switch + sticky save bar.', category: 'forms', tone: 'neutral' },
  { name: 'filter-bar', composes: 'Select / Combobox + Pill / SegmentedControl + search TextInput.', category: 'forms', tone: 'neutral' },
  { name: 'confirm-dialog', composes: 'Modal / Dialog + Primary / DeleteButton; promise-based hook.', category: 'interaction', tone: 'spark' },
  { name: 'toast-center', composes: 'Toast + Banner queue with a useToast hook.', category: 'interaction', tone: 'spark' },
  { name: 'page-tabs', composes: 'Tabs bound to a content-switch layout.', category: 'interaction', tone: 'spark' },
  { name: 'user-menu', composes: 'Avatar + Menu of account actions.', category: 'interaction', tone: 'spark' },
  { name: 'app-shell', composes: 'Header + collapsible SidePanel + main region.', category: 'structure', tone: 'neutral' },
  { name: 'data-table', composes: 'Table + Pagination + row-select + search + sortable headers.', category: 'structure', tone: 'neutral' },
  { name: 'detail-drawer', composes: 'SidePanel expand / collapse wrapping a detail record + actions.', category: 'structure', tone: 'neutral' },
  { name: 'dashboard', composes: 'app-shell + page-header + stat-card grid + data-table.', category: 'page', tone: 'muted' },
  { name: 'list-detail', composes: 'app-shell + data-table + detail-drawer.', category: 'page', tone: 'muted' },
]

function BlockCard({ block, onOpen }: { block: Block; onOpen: (b: Block) => void }) {
  return (
    <motion.li className={styles.cardItem} variants={fadeUp}>
      <motion.button
        type="button"
        className={styles.card}
        onClick={() => onOpen(block)}
        aria-haspopup="dialog"
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <span className={styles.cardHead}>
          <code className={styles.blockName}>{block.name}</code>
          <span className={`${styles.tag} ${styles[block.tone]}`}>{block.category}</span>
        </span>
        <span className={styles.cardBody}>{block.composes}</span>
        <span className={styles.cardCue}>
          Preview
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" />
          </svg>
        </span>
      </motion.button>
    </motion.li>
  )
}

function PreviewModal({ block, onClose }: { block: Block | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!block) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [block, onClose])

  if (!block) return null

  const Preview = BLOCK_PREVIEWS[block.name]
  const addCommand = `/canvasmith:add ${block.name}`
  const shadcnUrl = `npx shadcn@latest add https://canvasmith.dev/r/${block.name}.json`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalStage}>
          <div className={styles.stageChrome}>
            <span className={styles.stageDots} aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className={styles.stageUrl}>
              <code>{block.name}</code> · Canvas Kit preview
            </span>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close preview"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
          <div className={styles.stageBody}>{Preview ? <Preview /> : null}</div>
        </div>

        <div className={styles.modalMeta}>
          <div className={styles.metaHead}>
            <h3 id={titleId} className={styles.metaTitle}>
              <code>{block.name}</code>
            </h3>
            <span className={`${styles.tag} ${styles[block.tone]}`}>{block.category}</span>
          </div>
          <p className={styles.metaBody}>{block.composes}</p>

          <p className={styles.metaLabel}>Add it</p>
          <CommandBlock command={addCommand} prompt="/" />
          <div className={styles.alt}>
            <span className={styles.altLabel}>or with the shadcn CLI</span>
            <div className={styles.altRow}>
              <code className={styles.altCode}>{shadcnUrl}</code>
              <CopyButton value={shadcnUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegistryShowcase() {
  const [active, setActive] = useState<Block | null>(null)
  const open = useCallback((b: Block) => setActive(b), [])
  const close = useCallback(() => setActive(null), [])

  return (
    <Section id="registry" tone="surface" eyebrow="THE REGISTRY">
      <motion.div
        className={styles.layout}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 className={styles.heading} variants={fadeUp}>
          Real Workday blocks. One command away.
        </motion.h2>

        <motion.p className={styles.sub} variants={fadeUp}>
          A shadcn-compatible registry of vetted, real Canvas Kit blocks &mdash;
          token-correct and accessible out of the box.{' '}
          <strong className={styles.subStrong}>Click any block to preview it</strong>,
          then copy it into your project with a single command.
        </motion.p>

        <ul className={styles.grid} role="list">
          {BLOCKS.map((block) => (
            <BlockCard key={block.name} block={block} onOpen={open} />
          ))}
        </ul>
      </motion.div>

      <PreviewModal block={active} onClose={close} />
    </Section>
  )
}
