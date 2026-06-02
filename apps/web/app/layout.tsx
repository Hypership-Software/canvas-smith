import type { Metadata } from 'next'
import { Roboto, Roboto_Mono } from 'next/font/google'

import CanvasStyleRegistry from './registry'
import './globals.css'

/**
 * RootLayout — Server Component.
 *
 * Loads the brand type via next/font (zero layout shift, self-hosted), exposes
 * it as CSS variables on <html>, exports the site Metadata, and wraps the tree
 * in <CanvasStyleRegistry> so the live Canvas Kit demo's Emotion styles flush
 * correctly during SSR.
 *
 * The site is intentionally Roboto end-to-end: Roboto is THE Workday Canvas
 * system typeface, so leading with it — heavy weights for display, regular for
 * body — is what makes the marketing read as genuinely Workday-native rather
 * than a generic SaaS site. `--font-body` doubles as the display family (see
 * `--cm-font-display` in globals.css); Roboto Mono renders install commands.
 */

const body = Roboto({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://canvasmith.dev'),
  title: 'Canvasmith — Make it look like Workday built it',
  description:
    'Canvasmith is a Claude plugin that makes AI-built front-ends look Workday-native using real Canvas Kit components and tokens.',
  applicationName: 'Canvasmith',
  keywords: [
    'Workday Canvas',
    'Canvas Kit',
    'Claude plugin',
    'design system',
    'AI front-end',
    'design tokens',
  ],
  openGraph: {
    type: 'website',
    url: 'https://canvasmith.dev',
    siteName: 'Canvasmith',
    title: 'Canvasmith — Make it look like Workday built it',
    description:
      'Canvasmith is a Claude plugin that makes AI-built front-ends look Workday-native using real Canvas Kit components and tokens.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Canvasmith — Canvas-native UI for your AI.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canvasmith — Make it look like Workday built it',
    description:
      'Canvasmith is a Claude plugin that makes AI-built front-ends look Workday-native using real Canvas Kit components and tokens.',
    images: ['/og.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable}`}>
      {/*
        suppressHydrationWarning: browser extensions (ColorZilla's
        `cz-shortcut-listen`, Grammarly's `data-gr-*`, etc.) inject attributes
        onto <body> before React hydrates, which otherwise trips a hydration
        attribute-mismatch warning. This suppresses that one-level body diff only.
      */}
      <body suppressHydrationWarning>
        <CanvasStyleRegistry>{children}</CanvasStyleRegistry>
      </body>
    </html>
  )
}
