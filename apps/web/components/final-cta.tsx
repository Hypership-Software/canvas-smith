import * as React from 'react'

import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'
import styles from './final-cta.module.css'

/**
 * FinalCTA — slim closing band before the footer (R6 §3.10).
 *
 * Server Component: the H2 + sub are static; interactivity is isolated to the
 * leaf <Button> (an anchor to #install) and <CopyButton> (its own client
 * component). The primary install command is shown inline so the page closes
 * on the exact thing we want copied.
 */

const PRIMARY_COMMAND = '/plugin marketplace add canvasmith/canvasmith'

export function FinalCTA() {
  return (
    <Section tone="paper2" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Stop shipping UI that looks like AI.</h2>
        <p className={styles.sub}>
          Make your agent build like it works at Workday.
        </p>

        <div className={styles.actions}>
          <Button as="a" href="#install" variant="primary">
            Add to Claude
          </Button>

          <div className={styles.command}>
            <code className={styles.code}>
              <span className={styles.prompt} aria-hidden="true">
                /
              </span>
              <span className={styles.commandText}>
                plugin marketplace add canvasmith/canvasmith
              </span>
            </code>
            <CopyButton value={PRIMARY_COMMAND} />
          </div>
        </div>
      </div>
    </Section>
  )
}
