'use client'

import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import styles from './site-nav.module.css'

/**
 * SiteNav — R6 §3.1. Client Component (scroll listener + mobile sheet state).
 *
 * Transparent over the dark hero band; once the user scrolls past the hero band
 * it becomes a sticky, frosted `--cm-paper` bar with a hairline bottom border.
 * On mobile the links collapse behind a hamburger that opens a full-screen sheet.
 *
 * Links are in-page anchors (smooth-scroll handled globally via
 * `scroll-behavior` + `scroll-padding-top` in globals.css).
 */

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: "What's included", href: '#whats-included' },
  { label: 'Before / After', href: '#before-after' },
  { label: 'Install', href: '#install' },
  { label: 'FAQ', href: '#faq' },
] as const

const REPO_URL = 'https://github.com/Hypership-Software/canvas-smith'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Frost the bar once the hero band scrolls past the top edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the full-screen mobile sheet is open.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  // Close the sheet on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const headerClasses = [styles.header, scrolled ? styles.scrolled : '']
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClasses} data-scrolled={scrolled ? 'true' : 'false'}>
      <nav className={styles.nav} aria-label="Primary">
        <a href="#top" className={styles.brand} aria-label="Canvasmith — home">
          <SparkGlyph className={styles.spark} />
          <span className={styles.wordmark}>Canvasmith</span>
        </a>

        <ul className={styles.links} role="list">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a
            className={styles.star}
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star Canvasmith on GitHub"
          >
            <GitHubGlyph className={styles.starIcon} />
            <span className={styles.starLabel}>Star</span>
            <span className={styles.starCount}>1.2k</span>
          </a>

          <Button href="#install" className={styles.cta}>
            Add to Claude
          </Button>

          <button
            type="button"
            className={styles.hamburger}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-sheet"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.hamburgerBox} data-open={menuOpen ? 'true' : 'false'}>
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile full-screen sheet */}
      <div
        id="mobile-nav-sheet"
        className={styles.sheet}
        data-open={menuOpen ? 'true' : 'false'}
        hidden={!menuOpen}
      >
        <ul className={styles.sheetLinks} role="list">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={styles.sheetLink} onClick={closeMenu}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.sheetActions}>
          <a
            className={styles.sheetStar}
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            <GitHubGlyph className={styles.starIcon} />
            <span>Star on GitHub</span>
            <span className={styles.starCount}>1.2k</span>
          </a>
          <Button href="#install" className={styles.sheetCta} onClick={closeMenu}>
            Add to Claude
          </Button>
        </div>
      </div>
    </header>
  )
}

/** The forge-spark mark: an anvil-struck spark in the warm `--cm-spark` accent. */
function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 1.5l1.9 5.4 5.4 1.9-5.4 1.9L11 16l-1.9-5.3L3.7 8.8l5.4-1.9L11 1.5z"
        fill="currentColor"
      />
      <circle cx="16.5" cy="16.5" r="1.6" fill="currentColor" opacity="0.65" />
      <circle cx="5.6" cy="17.4" r="1.1" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

function GitHubGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
