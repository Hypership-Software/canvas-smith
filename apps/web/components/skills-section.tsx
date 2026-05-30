'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { Section } from '@/components/ui/section'
import { fadeUp, stagger } from '@/lib/motion'
import styles from './skills-section.module.css'

/**
 * SkillsSection — R6 §3.6. Warm `--cm-paper-2` panel.
 *
 * The toolkit grid: one SkillCard per slash command in the canonical Canvasmith
 * set, each showing the monospace command, a one-line description, and a small
 * color-coded category tag. Cards are NOT three identical icon-title-blurb tiles
 * (anti-slop): the mono command name is the visual anchor. Hover lifts the card
 * `y:-4` and shifts the border to `--cm-blue` (no scale). Entrance is a
 * `whileInView` fadeUp stagger gated by `prefers-reduced-motion`.
 */

/** Tag families map to a subtle color treatment (see §3.6 builder note). */
type Tone = 'blue' | 'neutral' | 'spark' | 'muted'

interface Skill {
  command: string
  description: string
  tag: string
  tone: Tone
}

const SKILLS: Skill[] = [
  {
    command: '/canvasmith:init',
    description:
      'Detects your stack and sets up Canvas Kit, then writes CANVAS.md.',
    tag: 'setup',
    tone: 'blue',
  },
  {
    command: '/canvasmith:build SCREEN',
    description:
      'Generates a screen from real Canvas Kit components, blocks, and tokens.',
    tag: 'generate',
    tone: 'blue',
  },
  {
    command: '/canvasmith:add BLOCK',
    description:
      'Adds a vetted Workday block (DataTable, AppShell, SettingsForm…) from the Canvasmith registry.',
    tag: 'blocks',
    tone: 'blue',
  },
  {
    command: '/canvasmith:convert',
    description:
      'Refactors existing AI-generated UI to Canvas Kit components and cssVar() tokens.',
    tag: 'migrate',
    tone: 'blue',
  },
  {
    command: '/canvasmith:tokens',
    description: 'Maps raw colors and spacing to the nearest Canvas token.',
    tag: 'tokens',
    tone: 'neutral',
  },
  {
    command: '/canvasmith:component',
    description:
      'Scaffolds a new component with createStencil following Canvas patterns.',
    tag: 'scaffold',
    tone: 'neutral',
  },
  {
    command: '/canvasmith:audit',
    description:
      'Flags off-brand color, non-token spacing, wrong radius, and missing focus/a11y.',
    tag: 'verify',
    tone: 'spark',
  },
  {
    command: '/canvasmith:docs COMPONENT',
    description:
      'Pulls the real prop table and usage for a Canvas Kit component into context.',
    tag: 'reference',
    tone: 'muted',
  },
]

/**
 * SkillCard — one command tile. The command is rendered as monospace and split
 * so the namespace reads quietly and the verb/args carry the emphasis.
 */
function SkillCard({ skill }: { skill: Skill }) {
  const [namespace, ...rest] = skill.command.split(':')
  const action = rest.join(':')

  return (
    <motion.li
      className={styles.card}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className={styles.cardHead}>
        <code className={styles.command}>
          <span className={styles.namespace}>{namespace}:</span>
          <span className={styles.action}>{action}</span>
        </code>
        <span
          className={`${styles.tag} ${styles[skill.tone]}`}
          aria-label={`Category: ${skill.tag}`}
        >
          {skill.tag}
        </span>
      </div>
      <p className={styles.cardBody}>{skill.description}</p>
    </motion.li>
  )
}

export function SkillsSection() {
  return (
    <Section id="whats-included" tone="paper2" eyebrow="WHAT'S INCLUDED">
      <motion.div
        className={styles.layout}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 className={styles.heading} variants={fadeUp}>
          A toolkit for Canvas-native front-ends.
        </motion.h2>

        <motion.p className={styles.sub} variants={fadeUp}>
          Slash commands and skills that install with the plugin. Run them in
          Claude Code.
        </motion.p>

        <ul className={styles.grid} role="list">
          {SKILLS.map((skill) => (
            <SkillCard key={skill.command} skill={skill} />
          ))}
        </ul>
      </motion.div>
    </Section>
  )
}
