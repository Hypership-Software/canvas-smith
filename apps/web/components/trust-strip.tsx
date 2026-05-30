import * as React from 'react'

import { Container } from '@/components/ui/container'
import styles from './trust-strip.module.css'

/**
 * TrustStrip — R6 §3.3. A quiet, thin credibility band that sits directly under
 * the hero. Server Component (static, no interaction).
 *
 * The message is "we use the actual published packages, pinned" — so the chips
 * carry the real, pinned npm coordinates verbatim. These versions are
 * load-bearing: they match the packages the plugin installs and the live demo
 * imports. Do not abbreviate or float the versions.
 */

const PACKAGES = [
  '@workday/canvas-kit-react@15.0.6',
  '@workday/canvas-tokens-web@4.3.0',
  '@workday/canvas-system-icons-web@4.0.4',
] as const

export function TrustStrip() {
  return (
    <aside className={styles.strip} aria-label="Built on the real Workday Canvas packages">
      <Container className={styles.inner}>
        <p className={styles.caption}>Built on the real thing</p>
        <ul className={styles.chips} role="list">
          {PACKAGES.map((pkg) => (
            <li key={pkg} className={styles.chip}>
              <span className={styles.dot} aria-hidden="true" />
              <code className={styles.code}>{pkg}</code>
            </li>
          ))}
        </ul>
      </Container>
    </aside>
  )
}
