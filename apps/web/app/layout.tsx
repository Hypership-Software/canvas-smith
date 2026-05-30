import type { Metadata } from 'next'
import { Fraunces, Roboto, Roboto_Mono } from 'next/font/google'

import CanvasStyleRegistry from './registry'
import './globals.css'

/**
 * RootLayout — Server Component.
 *
 * Loads the brand type pairing via next/font (zero layout shift, self-hosted),
 * exposes them as CSS variables on <html>, exports the site Metadata, and wraps
 * the tree in <CanvasStyleRegistry> so the live Canvas Kit demo's Emotion styles
 * flush correctly during SSR.
 *
 * Fraunces (display) gives the editorial, "forged" serif headline voice; Roboto
 * (body/UI) is the direct Canvas tie-in; Roboto Mono renders install commands.
 */

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const body = Roboto({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
  display: 'swap',
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
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
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <CanvasStyleRegistry>{children}</CanvasStyleRegistry>
      </body>
    </html>
  )
}
