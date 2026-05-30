# Canvas Kit Setup Reference (Next.js 15 App Router + SSR)

The complete, exact wiring to make Canvas Kit render correctly. The runnable equivalent of `/canvasmith:init`. Pinned versions and exact import paths throughout — **do not drift from them.**

## The one architectural fact that drives everything

`@workday/canvas-kit-styling` is **NOT plain `@emotion/react`**. It uses `@emotion/css` with its **own custom Emotion instance/cache**, and **injects styles at module-import (JS evaluation) time, not at render time.** Three consequences:

1. **Every file that imports a Canvas component — or calls `createStyles`/`createStencil` — must be a Client Component (`'use client'`)** or be imported only from client components. Canvas components are not React Server Components.
2. The Emotion cache Canvas uses is the one returned by **`getCache()`** from `@workday/canvas-kit-styling`. `<CanvasProvider>` internally wraps `<CacheProvider value={getCache()}>`. For correct SSR you must feed **that same cache** into the `useServerInsertedHTML` registry — do not create a second unrelated cache.
3. Because static styles inject at import time (before render), `<CacheProvider>` alone is not enough for SSR. The App Router `useServerInsertedHTML` registry pattern (§4) is what serializes collected rules into `<head>` during streaming and prevents FOUC.

## 1. Install — pin these EXACT versions

```bash
npm install @workday/canvas-kit-react@15.0.6 \
  @workday/canvas-kit-styling@15.0.6 \
  @workday/canvas-tokens-web@4.3.0 \
  @workday/canvas-system-icons-web@4.0.4 \
  @workday/canvas-kit-react-fonts \
  @workday/canvas-kit-preview-react@15.0.6 \
  @emotion/react@^11.7 @emotion/styled@^11.6 @emotion/cache @emotion/server
```

- **React 18.** Canvas Kit requires React ≥ 17; Next.js 15 ships React 18/19 — React 18 is the safe target.
- `@emotion/cache` + `@emotion/server` power the SSR registry (`createEmotionServer`). `@emotion/styled` is a peer dep a few legacy components need.
- `@workday/canvas-kit-react-fonts` tracks the react package version (15.0.6).

## 2. Import the FOUR token CSS files (ONCE, globally)

The JS token objects (`base`, `brand`, `system`, `component`) resolve to `var(--cnvs-...)` strings. Those CSS custom properties only exist if you import the four `_variables.css` files. Without them, every token resolves to an **undefined** CSS variable and nothing renders correctly.

Import them **once**, at the top of the **root layout** `app/layout.tsx` (a Server Component is fine for plain CSS imports), or `@import` them from `app/globals.css`. **Exact specifiers — order base → brand → system → component** (system/component reference base/brand vars):

```ts
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';
```

All four are required. Component tokens (e.g. `component.systemIcon.size.xs`) live in the 4th file. Generated CSS variable names are prefixed `--cnvs-`, e.g. `system.color.fg.inverse` → `var(--cnvs-sys-color-fg-inverse)`.

## 3. Inject the Roboto fonts

`@workday/canvas-kit-react-fonts` exports a `fonts` array of `@font-face` `CSSObject`s pointing at `https://design.workdaycdn.com/beta/assets/fonts@1.0.0/roboto/ttf` (Roboto weights 300/400/500/700 + Roboto Mono 400). Inject them through Canvas Kit's Emotion-compatible **`injectGlobal` from `@workday/canvas-kit-styling`** (NOT `@emotion/react`'s) so they land in the **same Emotion instance** and are understood by the static transformer.

Put this in a **client module** imported by the provider, so it runs once and is picked up by the SSR cache — `app/canvas-fonts.ts`:

```ts
'use client';
import {fonts} from '@workday/canvas-kit-react-fonts';
import {injectGlobal, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

// @ts-ignore — fonts is CSSObject[]; injectGlobal accepts it
injectGlobal({
  ...fonts,
  'html, body': {
    fontFamily: cssVar(system.fontFamily.default), // var(--cnvs-sys-font-family-default) → Roboto
    margin: 0,
    minHeight: '100vh',
  },
});
```

> Why Canvas's `injectGlobal` and not `@emotion/react`'s? Canvas re-exports a version bound to its custom Emotion instance and auto-wraps token vars. The wrong `injectGlobal` puts rules in the wrong cache.

## 4. The Emotion SSR registry for App Router (THE critical pattern)

Next.js App Router requires a 3-step opt-in for any CSS-in-JS lib: (1) a **style registry** collecting rules per render, (2) **`useServerInsertedHTML`** to inject before content, (3) a **Client Component** wrapping the app. For Canvas you swap in `@emotion/server`'s extraction — and **the cache you register MUST be the same one Canvas uses**, so call `getCache()` so the registry, `<CanvasProvider>`, and all import-time static styles share one instance.

`app/registry.tsx`:

```tsx
'use client';

import * as React from 'react';
import {useState} from 'react';
import {useServerInsertedHTML} from 'next/navigation';
import {CacheProvider} from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import {getCache} from '@workday/canvas-kit-styling';

export default function CanvasStyleRegistry({children}: {children: React.ReactNode}) {
  // Lazy init so it only runs once. getCache() returns Canvas Kit's shared Emotion instance/cache.
  const [{cache, extractCriticalToChunks}] = useState(() => {
    const cache = getCache();          // the SAME cache CanvasProvider + createStyles use
    cache.compat = true;               // required: collect rules into cache.inserted for flushing
    const prevInsert = cache.insert.bind(cache);
    const inserted: string[] = [];
    // Track names inserted during this render so we know what to flush
    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const {extractCriticalToChunks} = createEmotionServer(cache);
    (cache as any).__inserted = inserted;
    return {cache, extractCriticalToChunks};
  });

  useServerInsertedHTML(() => {
    const names = (cache as any).__inserted as string[];
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    (cache as any).__inserted = [];
    if (styles === '') return null;
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{__html: styles}}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
```

> - `useServerInsertedHTML` runs during streaming SSR and flushes collected rules into the document **before** the content that uses them — this is what prevents FOUC.
> - `cache.compat = true` makes Emotion populate `cache.inserted` (serialized CSS by name) so the registry can read it back out — the same mechanism MUI/Chakra registries use.
> - On the **client**, `CacheProvider` simply reuses the cache; styles already in `<head>` hydrate, and Emotion appends new ones at runtime.
> - A simpler alternative shape (used by many libs) creates a fresh `createCache({key:'css', prepend:true})` — that works for plain `@emotion/react`, but for Canvas you should reuse `getCache()` so import-time static styles land in the registered cache.

## 5. The Canvas provider boundary (`'use client'`)

`<CanvasProvider>` (from `@workday/canvas-kit-react/common`) renders a `<div>` with theming CSS vars and wraps the Emotion `<CacheProvider value={getCache()}>` + a `<ThemeProvider>`. **Theming in v15 is via CSS tokens, not the provider** — the `theme` prop is for scoped/legacy overrides only and is discouraged. Make a thin client wrapper that also pulls in the fonts side-effect — `app/providers.tsx`:

```tsx
'use client';
import * as React from 'react';
import {CanvasProvider} from '@workday/canvas-kit-react/common';
import './canvas-fonts'; // side-effect: injectGlobal Roboto into the shared cache

export function Providers({children}: {children: React.ReactNode}) {
  return <CanvasProvider>{children}</CanvasProvider>;
}
```

## 6. Root layout wiring (`app/layout.tsx`)

The root layout stays a Server Component — it only does static CSS imports and composes the client wrappers:

```tsx
// app/layout.tsx  (Server Component — only static CSS imports + composing client wrappers)
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

## 7. `next.config` — transpile Canvas packages

Canvas ships ESM/CJS that Next should transpile:

```js
// next.config.mjs
const nextConfig = {
  transpilePackages: [
    '@workday/canvas-kit-react',
    '@workday/canvas-kit-styling',
    '@workday/canvas-kit-preview-react',
    '@workday/canvas-kit-react-fonts',
    '@workday/canvas-tokens-web',
  ],
};
export default nextConfig;
```

## 8. The `'use client'` rule (non-negotiable)

**Every file that imports a Canvas component or calls `createStyles`/`createStencil` must start with `'use client'`** (or be imported only from a client component). Canvas styles inject at import time, so these modules are client modules — there is no RSC version.

```tsx
// app/page.tsx
'use client';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
export default function Page() {
  return <PrimaryButton>Hello Canvas</PrimaryButton>;
}
```

The root `layout.tsx` is the one exception — it can stay a Server Component because it only does plain CSS imports and renders the client wrappers; it never touches a Canvas component directly.

## 9. Static compilation (optional, production perf)

`@workday/canvas-kit-styling-transform` pre-builds style objects into CSS strings at **build time** (moves hashing/serialization out of the browser). It ships a webpack loader + `StylingWebpackPlugin` you'd add inside `webpack: (config) => {...}` in `next.config`. Caveats:

- Stricter rules: values must be statically analyzable by TypeScript — use `const` / `as const` / generics; `let` and loosely-typed objects break it.
- Static hashes depend on the start/end char index of a style block in the source file, so adding code before a block (e.g. a `console.log`) shifts the hash. This is deliberate — it makes server and client agree during hydration.
- It "may be required for SSR, especially with React Server Components." For a first pass the **runtime** path (§4 registry + `cache.compat`) works without the transform; add the transform later for production perf.

## 10. Vite / CRA (short notes)

No Next.js registry is needed — these are SPA/client-rendered:

- **Vite:** import the four token CSS files once in your entry (`main.tsx`), inject fonts via Canvas's `injectGlobal` (§3), and wrap the app in `<CanvasProvider>`. No `transpilePackages`; Vite handles ESM. Canvas Styling's runtime path works out of the box (no SSR flush to manage).
- **CRA:** same — token CSS imports in `index.tsx`, fonts via `injectGlobal`, `<CanvasProvider>` at the root. No SSR registry.
- If you ever use **Canvas Styling without Canvas React**, still provide the cache yourself: `<CacheProvider value={getCache()}><App/></CacheProvider>`. To set a CSP `nonce`, call `createInstance({nonce})` from `@workday/canvas-kit-styling` during bootstrap **before any Canvas component import** — the instance can't change after the first import.

## Import-path cheat sheet

| Symbol | Import from |
|---|---|
| `createStyles`, `createStencil`, `createVars`, `cssVar`, `px2rem`, `calc`, `colorSpace`, `handleCsProp`, `keyframes`, `injectGlobal`, `getCache`, `createInstance`, `CSProps` | `@workday/canvas-kit-styling` |
| `createComponent`, `CanvasProvider` | `@workday/canvas-kit-react/common` |
| `Box`, `Flex`, `Grid` | `@workday/canvas-kit-react/layout` |
| `base`, `brand`, `system`, `component` (token objects) | `@workday/canvas-tokens-web` |
| token CSS files | `@workday/canvas-tokens-web/css/{base,brand,system,component}/_variables.css` |
| `fonts` | `@workday/canvas-kit-react-fonts` |
| `CacheProvider` | `@emotion/react` |
| `createCache` | `@emotion/cache` |
| `createEmotionServer` | `@emotion/server/create-instance` |
| `useServerInsertedHTML` | `next/navigation` |
