'use client'

/**
 * CanvasLive — the ONLY place on the marketing site where real Canvas Kit and
 * Emotion are used.
 *
 * It does three things, in order:
 *   1. Imports the four `@workday/canvas-tokens-web` `_variables.css` files so the
 *      `--cnvs-*` CSS custom properties exist (base → brand → system → component).
 *   2. Injects the Roboto / Roboto Mono @font-faces via Canvas Kit's `injectGlobal`
 *      (bound to Canvas's Emotion instance) so static styles + fonts share one cache.
 *   3. Wraps children in <CanvasProvider> (the theming + Emotion cache boundary).
 *
 * Wrap ONLY the live "after" demo in this — never the whole page. The rest of the
 * marketing site stays Emotion-free and is styled with CSS Modules + `--cm-*` tokens.
 * SSR flushing is handled by <CanvasStyleRegistry> in app/layout.tsx.
 */

import * as React from 'react'
import { CanvasProvider } from '@workday/canvas-kit-react/common'
import { injectGlobal, cssVar } from '@workday/canvas-kit-styling'
import { system } from '@workday/canvas-tokens-web'
import { fonts } from '@workday/canvas-kit-react-fonts'

// The four token stylesheets — order matters (system/component reference base/brand).
import '@workday/canvas-tokens-web/css/base/_variables.css'
import '@workday/canvas-tokens-web/css/brand/_variables.css'
import '@workday/canvas-tokens-web/css/system/_variables.css'
import '@workday/canvas-tokens-web/css/component/_variables.css'

// Inject the Roboto @font-faces into Canvas Kit's Emotion instance once at module
// import time. `fonts` is a CSSObject[]; injectGlobal accepts the spread.
injectGlobal({
  ...fonts,
  ':where(.cnvs-demo)': {
    fontFamily: cssVar(system.fontFamily.default),
  },
})

export default function CanvasLive({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CanvasProvider className="cnvs-demo">{children}</CanvasProvider>
  )
}
