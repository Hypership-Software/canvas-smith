import * as React from 'react'

import { Container } from '@/components/ui/container'
import styles from './site-footer.module.css'

/**
 * SiteFooter — dark `--cm-night` closing band (R6 §3.11).
 *
 * Server Component. Wordmark + spark glyph + one-liner, three link columns
 * (Product / Resources / More), the Workday trademark disclaimer, and quiet
 * GitHub + X social icons. Links use in-page #anchors where no page exists yet.
 */

const REPO_URL = 'https://github.com/canvasmith/canvasmith'
const X_URL = 'https://x.com/canvasmith'

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: "What's included", href: '#whats-included' },
      { label: 'Before / After', href: '#before-after' },
      { label: 'Install', href: '#install' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Docs', href: REPO_URL },
      { label: 'Command reference', href: '#whats-included' },
      { label: 'Changelog', href: `${REPO_URL}/releases` },
      { label: 'GitHub', href: REPO_URL },
    ],
  },
  {
    heading: 'More',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Report an issue', href: `${REPO_URL}/issues` },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="#top" className={styles.wordmark}>
              <span className={styles.spark} aria-hidden="true" />
              Canvasmith
            </a>
            <p className={styles.tagline}>Canvas-native UI for your AI.</p>
            <ul role="list" className={styles.social}>
              <li>
                <a
                  href={REPO_URL}
                  className={styles.socialLink}
                  aria-label="Canvasmith on GitHub"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <GitHubIcon />
                </a>
              </li>
              <li>
                <a
                  href={X_URL}
                  className={styles.socialLink}
                  aria-label="Canvasmith on X"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <XIcon />
                </a>
              </li>
            </ul>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {COLUMNS.map((column) => {
              const isExternal = (href: string) => href.startsWith('http')
              return (
                <div key={column.heading} className={styles.column}>
                  <h2 className={styles.columnHeading}>{column.heading}</h2>
                  <ul role="list" className={styles.columnLinks}>
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={styles.link}
                          {...(isExternal(link.href)
                            ? { target: '_blank', rel: 'noreferrer noopener' }
                            : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </nav>
        </div>

        <p className={styles.legal}>
          © 2026 Canvasmith. Not affiliated with or endorsed by Workday, Inc.
          Workday and Canvas are trademarks of Workday, Inc. Built with Next.js
          and the open-source Canvas Kit.
        </p>
      </Container>
    </footer>
  )
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.52 6.77 15.48 0h-1.41L8.89 5.88 4.75 0H0l6.25 8.9L0 16h1.41l5.46-6.2L11.25 16H16L9.52 6.77Zm-1.93 2.2-.63-.89L1.92 1.04h2.17l4.06 5.69.63.89 5.28 7.4h-2.17L7.59 8.97Z" />
    </svg>
  )
}
