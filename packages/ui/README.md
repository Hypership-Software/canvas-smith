# @canvasmith/ui

The **Canvasmith registry** — a [shadcn-compatible](https://ui.shadcn.com/docs/registry) registry of
**Workday Canvas–themed React components**. Every item is real
[`@workday/canvas-kit-react`](https://workday.github.io/canvas-kit/) code styled with
[emotion](https://emotion.sh/) + [Canvas design tokens](https://github.com/Workday/canvas-tokens) —
**no Tailwind, no Radix, no utility classes**.

This package holds the registry **source**. The Next.js site in `apps/web` hosts the **built** JSON
at `https://canvasmith.dev/r/<name>.json` (served statically from `apps/web/public/r/`).

## What's in the registry

Source lives under `registry/canvasmith/{ui,blocks,hooks}/`. The 14 canonical items:

**UI primitives** (`registry:ui`)

| Item | Composes |
| --- | --- |
| `stat-card` | Card + type tokens + trend StatusIndicator / delta |
| `empty-state` | SystemIcon + Heading + BodyText + primary CTA |
| `page-header` | Breadcrumbs + Heading + action button cluster |
| `filter-bar` | Select/Combobox + Pill/SegmentedControl + search TextInput |
| `user-menu` | Avatar + Menu of account actions |
| `confirm-dialog` | Modal/Dialog + Primary/Delete buttons + `useConfirmDialog` hook |
| `toast-center` | Toast + Banner queue + `useToast` hook |
| `page-tabs` | Tabs bound to a content-switch layout |

**Composed blocks** (`registry:component`)

| Item | Composes |
| --- | --- |
| `app-shell` | Header + collapsible SidePanel + main region |
| `data-table` | Table + Pagination + Checkbox select + search + sortable headers |
| `settings-form` | FormField groups + TextInput/Select/Switch + sticky save bar |
| `detail-drawer` | SidePanel (expand/collapse) wrapping a detail record + actions |

**Page blocks** (`registry:block`, ship a `registry:page` file)

| Item | Target | Composes |
| --- | --- | --- |
| `dashboard` | `app/dashboard/page.tsx` | app-shell + page-header + stat-card grid + data-table |
| `list-detail` | `app/list-detail/page.tsx` | app-shell + data-table + detail-drawer |

Cross-item dependencies are declared with the `@canvasmith` namespace (e.g. `dashboard` depends on
`@canvasmith/app-shell`, `@canvasmith/page-header`, `@canvasmith/stat-card`, `@canvasmith/data-table`).

## Required peer dependencies

Items declare and consumers install these pinned Canvas packages:

```
@workday/canvas-kit-react@^15.0.6
@workday/canvas-kit-styling@^15.0.6
@workday/canvas-kit-preview-react@^15.0.6
@workday/canvas-tokens-web@^4.3.0
@workday/canvas-system-icons-web@^4.0.4
@emotion/react@^11
```

## Building the registry

The build script (`scripts/build-registry.mjs`, zero-dependency Node ESM) reads `registry.json`,
inlines each file's `content`, attaches the `registry-item` `$schema`, and writes one
`<name>.json` per item plus a discovery index (`registry.json`) into `apps/web/public/r/`.

```bash
pnpm --filter @canvasmith/ui registry:build
```

Typecheck the registry source against the Canvas APIs:

```bash
pnpm --filter @canvasmith/ui typecheck
```

## Adding blocks to your project

### Option A — the Canvasmith Claude Code command (recommended for non-Tailwind apps)

```
/canvasmith:add dashboard
```

This copies the item source into your project and installs the Canvas dependencies directly,
**bypassing the shadcn CLI's Tailwind requirement entirely**.

### Option B — the shadcn CLI

```bash
# by URL
npx shadcn@latest add https://canvasmith.dev/r/stat-card.json

# or register the namespace once, then add by name
npx shadcn@latest registry add @canvasmith=https://canvasmith.dev/r/{name}.json
npx shadcn@latest add @canvasmith/dashboard
```

## Non-Tailwind consumers: the `components.json` stub-CSS workaround

Canvasmith items carry **zero `cssVars` / `css` / `tailwind` fields** — all styling lives inside
emotion in the `.tsx`, so `shadcn add` only **copies files + installs npm dependencies**. It never
needs to write into a project stylesheet.

However, the shadcn CLI still validates `components.json.tailwind.css` points to a CSS file that
imports Tailwind (it errors with **"No Tailwind CSS configuration found"** otherwise). To satisfy
that one-time check **without actually using Tailwind**:

1. Copy `components.json.example` (in this package) to your project root as `components.json`. It
   points `tailwind.css` at a stub file and sets `cssVariables: false`:

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": false,
     "tsx": true,
     "tailwind": {
       "config": "",
       "css": "src/shadcn-stub.css",
       "baseColor": "neutral",
       "cssVariables": false
     },
     "aliases": {
       "components": "@/components",
       "ui": "@/components/ui",
       "lib": "@/lib",
       "hooks": "@/hooks",
       "utils": "@/lib/utils"
     },
     "registries": {
       "@canvasmith": "https://canvasmith.dev/r/{name}.json"
     }
   }
   ```

2. Create the referenced stub CSS file `src/shadcn-stub.css` with a single line:

   ```css
   @import "tailwindcss";
   ```

   Nothing in Canvas Kit depends on this file — it exists only to pass the CLI's validation. You
   never have to wire Tailwind into your build. (The `/canvasmith:add` command in Option A skips this
   requirement altogether.)

## Styling conventions (no Tailwind)

- Style only with `createStyles` / `createStencil` + `cssVar(system.*)` tokens.
- Spacing via `system.space.*`, elevation via `system.depth[n]`, radius via `system.shape.*`,
  type via `system.type.*`.
- Use real Canvas components: `PrimaryButton`/`SecondaryButton`, `FormField` + `TextInput`/`Select`,
  `Table`, `SidePanel`, `Modal`/`Dialog`, `Tabs`, `Card`, `Menu`, `Pagination`, `StatusIndicator`
  (preview), `Avatar`, `SystemIcon`, `Box`/`Flex`/`Grid`.
- No hardcoded hex/px, no Tailwind, no emoji — use named icons from
  `@workday/canvas-system-icons-web`.
- Files using hooks/state/handlers start with the `'use client'` directive.
