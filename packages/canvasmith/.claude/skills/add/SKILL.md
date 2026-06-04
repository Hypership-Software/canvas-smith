---
name: add
description: Add a vetted Workday-native block from the Canvasmith registry (DataTable, AppShell, SettingsForm, PageHeader, EmptyState, ConfirmDialog, Toast center, and more) into the current project. Use when the user asks to add, install, drop in, or scaffold a Canvas block, table, app shell, settings form, page header, empty state, confirm dialog, toast/notification system, tabs layout, user menu, detail drawer, dashboard, or list-detail page — e.g. "add a data table", "drop in an app shell", "give me a settings form", "/canvasmith:add dashboard". This is decision-hierarchy LEVEL 1 — the most deterministic path to Workday-native UI: blocks are real Canvas Kit, token-correct, and a11y-complete.
user-invokable: true
license: MIT
args:
  - name: block
    description: The registry block to add (e.g. data-table, app-shell, settings-form, page-header, empty-state, confirm-dialog, toast-center, page-tabs, user-menu, detail-drawer, stat-card, filter-bar, dashboard, list-detail). See the catalog below.
    required: true
---

# /canvasmith:add — add a vetted Canvasmith registry block

Install the requested `block` from the Canvasmith registry into the consumer's project. Blocks are **real `@workday/canvas-kit-react` code**, styled only with `createStyles`/`createStencil` + `cssVar(system.*)` Canvas tokens, fully typed, and a11y-complete (FormField wiring, focus management, `aria-label`s). Adding a block is **decision-hierarchy LEVEL 1** — the most deterministic path to Workday-native UI and the first thing to reach for before composing primitives (level 2) or authoring a stencil (level 3).

The registry is hosted at `https://canvasmith.dev/r/<block>.json` (one JSON per item, shadcn registry-item schema). When you are working **inside this monorepo**, the source of truth is `packages/ui/registry/canvasmith/...` instead — read it directly.

> **Why a CLI-bypass is the PRIMARY path.** The shadcn `add` CLI is coupled to Tailwind: `init` (and any `add` that writes `cssVars`/`css`) validates that `components.json.tailwind.css` points at a CSS file importing Tailwind, and aborts with "No Tailwind CSS configuration found" otherwise. Canvasmith items carry **zero** `cssVars`/`css`/`tailwind` (all styling lives in emotion inside the `.tsx`), so they only need a file-copy + dependency-install. The skill below performs exactly that, with no `components.json` and no Tailwind required. The `npx shadcn` route still works for Tailwind projects and is documented as the ALTERNATE.

## (a) PRIMARY install flow — CLI-bypass (robust, no Tailwind)

Given a `block` name, do this end to end:

### 1. Resolve the item JSON

- **Inside this monorepo:** read `packages/ui/registry/canvasmith/...` directly. The mapping of block → source file paths is in the catalog below and in `../canvas-ui/reference/blocks.md`. (Equivalently, read the built `apps/web/public/r/<block>.json`.)
- **In a consumer project:** `fetch https://canvasmith.dev/r/<block>.json`. The JSON conforms to the shadcn registry-item schema: `{ name, type, dependencies[], registryDependencies[], files[]{ path, type, target?, content }, docs }`.

### 2. Resolve `registryDependencies` recursively

Each block lists the other registry items it composes from in `registryDependencies` (bare names, `@canvasmith/<name>` namespaced, or absolute URLs). Walk them **topologically** and fetch/read each one first, deduping by name. Files dedupe by target path (last wins); circular deps are not expected but should be guarded against. Example: `dashboard` pulls `app-shell`, `page-header`, `stat-card`, and `data-table`; `confirm-dialog` pulls its `use-confirm-dialog` hook.

### 3. Write each `files[].content` to the right path

Respect the consumer's `components.json` aliases when present; otherwise use these defaults:

| File `type` | Default destination |
|---|---|
| `registry:ui`, `registry:component` | `components/canvasmith/<name>.tsx` (alias `aliases.components`/`aliases.ui`) |
| `registry:hook` | `hooks/<name>.tsx` (alias `aliases.hooks`) |
| `registry:lib` | `lib/<name>.ts` (alias `aliases.lib`) |
| `registry:page` / `registry:file` | the file's **`target`** verbatim (e.g. `app/dashboard/page.tsx`) — this field is required for these types |

Rewrite cross-item imports to the consumer's layout. Source uses the `@/registry/canvasmith/...` alias (e.g. `import {StatCard} from '@/registry/canvasmith/ui/stat-card'`); rewrite those to wherever the dependency landed (e.g. `@/components/canvasmith/stat-card`). Preserve every `'use client'` directive at the top of files that use hooks/state/handlers — Canvas styles inject at import time, so these are never RSCs.

### 4. Install the item dependencies

Collect the union of `dependencies` across the block and all its resolved registry dependencies, then install with the consumer's **detected package manager** (`pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `bun.lockb`→bun, else npm). The pinned Canvas stack:

```bash
pnpm add @workday/canvas-kit-react @workday/canvas-kit-styling @workday/canvas-tokens-web @workday/canvas-system-icons-web @emotion/react
```

Some blocks also need `@workday/canvas-kit-preview-react` (Switch, StatusIndicator). If Canvas Kit isn't set up at all (no token CSS imports / no `CanvasProvider`), tell the user to run **`/canvasmith:init`** first — the block will render unstyled otherwise.

### 5. Print the item docs

Echo the item's `docs` string (and the exported Props interface name) so the user knows how to wire the block in. Note where each file landed and which dependencies were installed.

## (b) ALTERNATE install flow — `npx shadcn` (Tailwind projects)

For projects already on Tailwind + shadcn, the standard CLI works because Canvasmith items carry no CSS payload:

```bash
npx shadcn@latest add https://canvasmith.dev/r/data-table.json
```

Or register the namespace once in `components.json` and add by short name:

```jsonc
// components.json
{
  "registries": { "@canvasmith": "https://canvasmith.dev/r/{name}.json" }
}
```

```bash
npx shadcn@latest add @canvasmith/data-table
```

**Caveats for non-Tailwind consumers** (from R7 §5): there is no official no-Tailwind mode. `shadcn init` requires a `components.json` whose `tailwind.css` imports Tailwind. If the project has no Tailwind, either (1) commit a minimal `components.json` with `tailwind.css` pointing at a one-line **stub** CSS file (`@import "tailwindcss";`) and `cssVariables: false` — this only satisfies the validator, nothing wires Tailwind at runtime — or (2) just use the PRIMARY CLI-bypass flow above, which needs neither. Prefer the bypass whenever the Tailwind check blocks a consumer.

## Available blocks (the canonical 14)

Real Canvas Kit + token-correct + a11y-complete. Full catalog (commands, URLs, props, compose-from, when-to-use) in **`../canvas-ui/reference/blocks.md`**.

**Display & content**
- `stat-card` — KPI metric tile. Composes `Card` + type tokens + trend `StatusIndicator`/delta.
- `empty-state` — zero-data view. Composes `SystemIcon` + `Heading` + `BodyText` + primary CTA.
- `page-header` — page title bar. Composes `Breadcrumbs` + `Heading` + action button cluster.

**Inputs & forms**
- `settings-form` — grouped settings with sticky save bar. Composes `FormField` groups + `TextInput`/`Select`/`Switch`.
- `filter-bar` — toolbar filter row. Composes `Select`/`Combobox` + `Pill`/`SegmentedControl` + search `TextInput`.

**Interaction**
- `confirm-dialog` — promise-based confirm. Composes `Modal`/`Dialog` + `Primary`/`DeleteButton`; ships the `use-confirm-dialog` hook.
- `toast-center` — toast/banner queue. Composes `Toast` + `Banner`; ships the `use-toast` hook.
- `page-tabs` — tabbed content switch. Composes `Tabs` bound to a content-switch layout.
- `user-menu` — account menu. Composes `Avatar` + `Menu` account actions.

**Structure**
- `app-shell` — app layout scaffold. Composes header + collapsible `SidePanel` + main region.
- `data-table` — full table. Composes `Table` + `Pagination` + `Checkbox` row-select + search + sortable headers (generic `columns`/`data`).
- `detail-drawer` — master-detail panel. Composes `SidePanel` (expand/collapse) wrapping a detail record + actions.

**Full pages** (`registry:block` with a `registry:page` target → `app/<name>/page.tsx`)
- `dashboard` — composes `app-shell` + `page-header` + `stat-card` grid + `data-table`.
- `list-detail` — composes `app-shell` + `data-table` + `detail-drawer`.

## DO / DON'T

**DO**
- Reach for a block first (this is level 1) before composing primitives or authoring a stencil.
- Resolve `registryDependencies` recursively and install the union of `dependencies` once.
- Respect `components.json` aliases; honor the `target` for page/file items.
- Preserve `'use client'`; rewrite `@/registry/canvasmith/...` imports to where deps actually landed.
- Print the item `docs` and the exported Props interface so the user can wire it in.
- Before installing a full-page block (`dashboard`, `list-detail`), check whether the root layout already mounts `<AppShell>` (look in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`). If it does, the page block emits its body **without** rendering `<AppShell>` itself — keep `app-shell` in the block's `registryDependencies` so the component file still installs for the layout to import.

**DON'T**
- Don't require Tailwind — the PRIMARY flow copies files + installs deps with no `components.json`.
- Don't write `cssVars`/`css`/`tailwind` into the project — Canvasmith items have none; styling is emotion + tokens.
- Don't hand-rewrite a block's internals during install; add it as-is, then adapt in the project.
- Don't skip `/canvasmith:init` — if Canvas Kit isn't wired (token CSS + `CanvasProvider` + Roboto), the block renders unstyled.
