'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { CommandBlock } from '@/components/command-block'
import { CopyButton } from '@/components/copy-button'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './registry-showcase.module.css'

/**
 * RegistryShowcase — "What you can drop in" (R6 narrative, between SkillsSection
 * and BeforeAfter). Surfaces the Canvasmith registry on the marketing site as a
 * catalog of the canonical 14 blocks.
 *
 * This is a CATALOG, not the product surface: it uses the site's CSS-Modules +
 * `--cm-*` token layer ONLY — no Tailwind, no Canvas Kit. Each block renders as a
 * card whose monospace name is the visual anchor (anti-slop), with a one-line
 * compose description and a color-coded category tag mirroring SkillsSection.
 *
 * A CommandBlock shows the level-1 `/canvasmith:add data-table` command, and a
 * subdued alternate row shows the `npx shadcn@latest add …` URL with a CopyButton.
 * Entrance is a `whileInView` fadeUp stagger gated by prefers-reduced-motion via
 * the shared variants.
 */

/** Category tone → color treatment (shared vocabulary with SkillsSection). */
type Tone = 'blue' | 'neutral' | 'spark' | 'muted'

interface Block {
  name: string
  composes: string
  category: string
  tone: Tone
}

const BLOCKS: Block[] = [
  // Display & content
  {
    name: 'stat-card',
    composes: 'Card + type tokens + trend StatusIndicator / delta.',
    category: 'display',
    tone: 'blue',
  },
  {
    name: 'empty-state',
    composes: 'SystemIcon + Heading + BodyText + primary CTA.',
    category: 'display',
    tone: 'blue',
  },
  {
    name: 'page-header',
    composes: 'Breadcrumbs + Heading + action button cluster.',
    category: 'display',
    tone: 'blue',
  },
  // Inputs & forms
  {
    name: 'settings-form',
    composes: 'FormField groups + TextInput / Select / Switch + sticky save bar.',
    category: 'forms',
    tone: 'neutral',
  },
  {
    name: 'filter-bar',
    composes: 'Select / Combobox + Pill / SegmentedControl + search TextInput.',
    category: 'forms',
    tone: 'neutral',
  },
  // Interaction
  {
    name: 'confirm-dialog',
    composes: 'Modal / Dialog + Primary / DeleteButton; promise-based hook.',
    category: 'interaction',
    tone: 'spark',
  },
  {
    name: 'toast-center',
    composes: 'Toast + Banner queue with a useToast hook.',
    category: 'interaction',
    tone: 'spark',
  },
  {
    name: 'page-tabs',
    composes: 'Tabs bound to a content-switch layout.',
    category: 'interaction',
    tone: 'spark',
  },
  {
    name: 'user-menu',
    composes: 'Avatar + Menu of account actions.',
    category: 'interaction',
    tone: 'spark',
  },
  // Structure
  {
    name: 'app-shell',
    composes: 'Header + collapsible SidePanel + main region.',
    category: 'structure',
    tone: 'neutral',
  },
  {
    name: 'data-table',
    composes: 'Table + Pagination + row-select + search + sortable headers.',
    category: 'structure',
    tone: 'neutral',
  },
  {
    name: 'detail-drawer',
    composes: 'SidePanel expand / collapse wrapping a detail record + actions.',
    category: 'structure',
    tone: 'neutral',
  },
  // Full pages
  {
    name: 'dashboard',
    composes: 'app-shell + page-header + stat-card grid + data-table.',
    category: 'page',
    tone: 'muted',
  },
  {
    name: 'list-detail',
    composes: 'app-shell + data-table + detail-drawer.',
    category: 'page',
    tone: 'muted',
  },
]

/** ADD_URL — the alternate, copyable npx shadcn install line for the lead block. */
const ALT_INSTALL =
  'npx shadcn@latest add https://canvasmith.dev/r/data-table.json'

/**
 * BlockCard — one registry item. The mono block name is the anchor; the compose
 * line reads quietly; a category tag carries the color. Hover lifts via motion's
 * `y` and shifts the border to `--cm-blue` in CSS (reduced-motion safe).
 */
function BlockCard({ block }: { block: Block }) {
  return (
    <motion.li
      className={styles.card}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className={styles.cardHead}>
        <code className={styles.blockName}>{block.name}</code>
        <span
          className={`${styles.tag} ${styles[block.tone]}`}
          aria-label={`Category: ${block.category}`}
        >
          {block.category}
        </span>
      </div>
      <p className={styles.cardBody}>{block.composes}</p>
    </motion.li>
  )
}

export function RegistryShowcase() {
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
          token-correct and accessible out of the box. Copy them into your project
          with a single command, then make them yours.
        </motion.p>

        <ul className={styles.grid} role="list">
          {BLOCKS.map((block) => (
            <BlockCard key={block.name} block={block} />
          ))}
        </ul>

        <motion.div className={styles.install} variants={fadeUp}>
          <p className={styles.installLabel}>Add any block:</p>
          <CommandBlock command="/canvasmith:add data-table" prompt="/" />
          <div className={styles.alt}>
            <span className={styles.altLabel}>or with the shadcn CLI</span>
            <div className={styles.altRow}>
              <code className={styles.altCode}>{ALT_INSTALL}</code>
              <CopyButton value={ALT_INSTALL} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}
