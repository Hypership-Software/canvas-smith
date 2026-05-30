---
name: init
description: Set up Canvas Kit in this project so every screen can render real Workday Canvas UI. Detects the framework (Next.js App Router / Vite / CRA), installs the pinned Canvas Kit dependencies, adds the four token CSS imports, wires Roboto fonts, mounts CanvasProvider (plus the Emotion SSR registry for Next App Router), and writes a CANVAS.md capturing the project's Canvas conventions. Run this once, before /canvasmith:build or /canvasmith:convert. Use when the user says "set up Canvas Kit", "init canvasmith", "make this project Workday-native", or when Canvas Kit imports are missing.
user-invokable: true
license: MIT
args:
  - name: framework
    description: Force the framework target (next | vite | cra). Optional — detected automatically when omitted.
    required: false
---

# /canvasmith:init — set up Canvas Kit

Bootstrap a project so Canvas Kit components, Canvas Design Tokens, and Roboto render correctly — then record the conventions in `CANVAS.md`. This is the foundation `/canvasmith:build`, `/canvasmith:convert`, and the auto-invoked `canvas-ui` skill rely on. Run it once per project.

For the exact, copy-paste-correct SSR registry, `providers.tsx`, and font-injection code, read **`../canvas-ui/reference/setup.md`** before writing files. Pull the verbatim blocks from there rather than retyping them.

## Non-negotiables (do not drift)

- **Pinned versions — install exactly these:**
  ```
  @workday/canvas-kit-react@15.0.6
  @workday/canvas-kit-styling@15.0.6
  @workday/canvas-kit-preview-react@15.0.6
  @workday/canvas-tokens-web@4.3.0
  @workday/canvas-system-icons-web@4.0.4
  @workday/canvas-kit-react-fonts
  ```
- **React 18.** Canvas Kit needs React >= 17; target React 18 for safety.
- **Theming is via CSS token variables, NOT the `CanvasProvider` `theme` prop.** The `theme` prop is deprecated/scoped-only. Never theme through it.
- **Any file importing a Canvas component or calling `createStyles`/`createStencil` must be a Client Component** (`'use client'`) in Next App Router — Canvas styles inject at module-import time, so these are never React Server Components.

## Ordered steps the skill executes

### 1. Detect the framework (unless `framework` arg given)
Inspect `package.json` + project layout:
- **Next.js App Router** — `next` dependency **and** an `app/` directory (e.g. `app/layout.tsx`). This is the primary, fully-supported path.
- **Next.js Pages Router** — `next` + a `pages/` directory, no `app/`. Use an `_app.tsx`-based `CanvasProvider` wrap and Emotion's `_document.tsx` SSR instead of the App Router registry; reuse `getCache()`.
- **Vite** — `vite` dependency + `index.html` + `src/main.tsx`.
- **CRA** — `react-scripts` dependency + `src/index.tsx`.
Detect the package manager from the lockfile: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, else npm. State the detected framework + package manager before proceeding.

### 2. Install the pinned dependencies
Emit and run the install with the detected package manager. npm form (verbatim):
```bash
npm i @workday/canvas-kit-react@15.0.6 @workday/canvas-kit-styling@15.0.6 @workday/canvas-tokens-web@4.3.0 @workday/canvas-system-icons-web@4.0.4 @workday/canvas-kit-react-fonts
```
Then add the peers / SSR helpers:
```bash
npm i @workday/canvas-kit-preview-react@15.0.6 @emotion/react@^11.7 @emotion/styled@^11.6
```
For **Next App Router only**, also add the SSR registry deps:
```bash
npm i @emotion/cache @emotion/server
```
(swap `npm i` for `pnpm add` / `yarn add` / `bun add` as detected.)

### 3. Add the four token CSS imports — ONCE, globally
These CSS files define the `--cnvs-*` custom properties that every `system.*`/`base.*`/`brand.*`/`component.*` token resolves to. Without them, components render unstyled. Import order is **base → brand → system → component**.
```ts
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';
```
- **Next App Router:** top of `app/layout.tsx` (a Server Component — plain CSS imports are fine there).
- **Next Pages Router:** top of `pages/_app.tsx`.
- **Vite:** top of `src/main.tsx`.
- **CRA:** top of `src/index.tsx`.

### 4. Set up Roboto fonts
Inject the Canvas font faces through Canvas Kit's own `injectGlobal` (from `@workday/canvas-kit-styling`) so they land in the **same Emotion instance** the components use. Create a client-side module (e.g. `app/canvas-fonts.ts` / `src/canvas-fonts.ts`) and import it from the provider wrapper so it runs once. Take the exact block from **`../canvas-ui/reference/setup.md`**; shape:
```ts
'use client';
import {fonts} from '@workday/canvas-kit-react-fonts';
import {injectGlobal, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

injectGlobal({
  ...fonts,
  'html, body': {
    fontFamily: cssVar(system.fontFamily.default),
    margin: 0,
    minHeight: '100vh',
  },
});
```
Do **not** import `injectGlobal` from `@emotion/css` — that targets the wrong cache.

### 5. Add `CanvasProvider`
Make a thin client wrapper that mounts `CanvasProvider` (from `@workday/canvas-kit-react/common`) and side-effect-imports the fonts module. Theming stays in CSS tokens; do not pass `theme`.
```tsx
'use client';
import * as React from 'react';
import {CanvasProvider} from '@workday/canvas-kit-react/common';
import './canvas-fonts'; // side-effect: Roboto into the shared cache

export function Providers({children}: {children: React.ReactNode}) {
  return <CanvasProvider>{children}</CanvasProvider>;
}
```
- **Next App Router:** wrap `children` with the SSR registry **outside** `Providers` (step 6).
- **Vite/CRA/Pages Router:** wrap the app root with `CanvasProvider` once (no registry needed).

### 6. Next App Router — add the Emotion SSR registry
This is the load-bearing step that prevents flash-of-unstyled-content and hydration mismatches. The registry MUST reuse Canvas Kit's shared cache via `getCache()` (not a fresh `createCache`) so the styles injected at import time are flushed during streaming SSR via `useServerInsertedHTML`.

**Copy the registry verbatim from `../canvas-ui/reference/setup.md`** into `app/registry.tsx` — do not hand-write it; the `cache.compat = true` + `cache.insert` tracking + `useServerInsertedHTML` flush logic is exact. Then compose it in `app/layout.tsx`:
```tsx
// app/layout.tsx (Server Component — token CSS imports + composing client wrappers)
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';

import CanvasStyleRegistry from './registry';
import {Providers} from './providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <CanvasStyleRegistry>
          <Providers>{children}</Providers>
        </CanvasStyleRegistry>
      </body>
    </html>
  );
}
```
Also add Canvas packages to `transpilePackages` in `next.config.{js,mjs}`:
```js
transpilePackages: [
  '@workday/canvas-kit-react',
  '@workday/canvas-kit-styling',
  '@workday/canvas-kit-preview-react',
  '@workday/canvas-kit-react-fonts',
  '@workday/canvas-tokens-web',
],
```

### 7. Smoke-test the wiring
Add a single Canvas component to the entry page to confirm tokens + fonts + provider resolve. For App Router the page must be a client component:
```tsx
'use client';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
export default function Page() {
  return <PrimaryButton>Hello Canvas</PrimaryButton>;
}
```
A blue Roboto pill button confirms success. If it renders unstyled: the token CSS imports are missing or in the wrong place. If SSR shows a flash: the registry isn't reusing `getCache()`.

### 8. Write `CANVAS.md` at the project root
Capture the project's Canvas conventions so future `/canvasmith:build` runs and the `canvas-ui` skill stay consistent. Use the template below; fill in real values from what you set up and what you observe in the codebase (brand tokens already in use, components present, spacing rhythm). Do not leave placeholders.

## Quick gates after init (P0)
- [ ] All four token CSS files imported, once, in the entry file, in base→brand→system→component order.
- [ ] `CanvasProvider` wraps the whole app.
- [ ] Roboto injected via Canvas Kit `injectGlobal` (same cache).
- [ ] (Next App Router) Registry uses `getCache()`, sets `cache.compat = true`, flushes via `useServerInsertedHTML`.
- [ ] (Next App Router) Files using Canvas components start with `'use client'`.
- [ ] `CANVAS.md` exists at the project root.

---

## CANVAS.md template (write this to the project root)

```markdown
# CANVAS.md — Workday Canvas conventions for this project

> Maintained by Canvasmith. Read this before building or restyling any UI here.
> When conventions change, update this file (or re-run `/canvasmith:init`).

## Stack
- Framework: <Next.js App Router | Next.js Pages Router | Vite | CRA>
- Package manager: <npm | pnpm | yarn | bun>
- React: 18
- SSR style strategy: <Emotion registry reusing getCache() (Next App Router) | client-only CanvasProvider>

## Pinned Canvas Kit versions
- @workday/canvas-kit-react@15.0.6
- @workday/canvas-kit-styling@15.0.6
- @workday/canvas-kit-preview-react@15.0.6
- @workday/canvas-tokens-web@4.3.0
- @workday/canvas-system-icons-web@4.0.4
- @workday/canvas-kit-react-fonts
- @emotion/react ^11.7, @emotion/styled ^11.6

## Where things live
- Token CSS imports: <path, e.g. app/layout.tsx>
- Provider wrapper: <path, e.g. app/providers.tsx>
- Font injection: <path, e.g. app/canvas-fonts.ts>
- SSR registry (if any): <path, e.g. app/registry.tsx>

## Brand / theme tokens
- Brand accent / primary: system.color.brand.accent.primary (default Workday Blueberry blue-600)
- Focus ring: brand.common.focusOutline / system.color.border.primary.default (blue-500) — do not override casually
- Any project overrides: <list `[stencil.vars.x]: token` overrides, or "none — Workday defaults">

## Components in use
- <e.g. PrimaryButton, FormField + TextInput, Table, SidePanel, Tabs, Card, Modal — fill in as the app grows>
- Status indicators: use @workday/canvas-kit-preview-react/status-indicator (the react one is deprecated)

## Spacing rhythm (Canvas tokens only — base unit 4px)
- Page padding: system.space.x8 (32px)
- Field / section gap: system.gap.md (16px) → system.gap.lg (24px)
- Button-row gap: system.gap.md (16px); primary action first in LTR
- Tight gaps (icon↔label): system.gap.sm (8px)
- Never hand-roll pixel values — always a `system.*` token.

## Type
- Font: Roboto via system.fontFamily.default
- Use the Text components (Heading / BodyText / Subtext / Text) — do not set raw font-size/weight.
- Headings: <Heading as="hN" size="small|medium|large">

## Shape / radius
- Cards / inputs: system.shape.x1 (4px) / system.shape.x2 (8px)
- Buttons: full pill (system.legacy.shape.full) — Canvas default, don't change.

## DO
- Compose real Canvas Kit components; pass tokens via the `cs` prop using `createStyles`/`createStencil`.
- Wrap every labeled input in `FormField` with a `FormField.Label`.
- Give every icon-only button an `aria-label`.
- Use CSS logical properties (marginInline*, paddingBlock*) for RTL safety.

## DON'T
- No raw hex colors or arbitrary px — map to the nearest token (`/canvasmith:tokens`).
- No bare `<input>`/`<button>` HTML where a Canvas component exists.
- No theming through the `CanvasProvider` `theme` prop.
- Don't pass raw style objects to `cs` for static styles — use `createStyles` (keeps the perf/static path).

## Workflow
- New screen: `/canvasmith:build <screen>`
- Add a vetted block: `/canvasmith:add <block>`
- Restyle existing AI UI: `/canvasmith:convert`
- Map raw values to tokens: `/canvasmith:tokens`
- Check before shipping: `/canvasmith:audit`
```
