# Workday Chrome Enforcement — Design Spec

**Date:** 2026-06-04
**Scope:** Canvasmith plugin (`packages/canvasmith`) and its registry (`packages/ui/registry/canvasmith`).

## Problem

Coding agents using Canvasmith currently produce Workday-token-correct components but do not consistently wrap their prototypes in Workday product chrome (top white bar + narrow icon sidebar). The result feels Canvas-flavoured but not Workday-native. Two gaps cause this:

1. **Visual gap.** The existing `app-shell` block uses a collapsible Canvas `SidePanel` (320 ↔ 64 px) with labels beside icons. Real Workday product chrome uses a fixed narrow icon rail (~80 px) with labels *under* icons, an active-state pill behind only the icon, and pinned bottom items (Saved, Settings).
2. **Enforcement gap.** Nothing in the plugin guarantees that a generated page is wrapped in any shell. `app-shell` is one block among many in the registry; agents may forget to use it.

## Goals

- Every prototype produced by Canvasmith renders inside a Workday-faithful chrome by default.
- The chrome is consumer-customisable (tenant logo, nav items, avatar) but its **layout and visual structure are fixed** — agents cannot stylistically drift away from Workday product chrome.
- Existing skill commands (`/canvasmith:add`, `/canvasmith:convert`, etc.) do the right thing without the agent needing to remember a wrap step.

## Non-goals

- Not building a multi-tenant theming system.
- Not adding a collapsible/expandable rail mode (real Workday product chrome is fixed; we match it).
- Not auditing or migrating any external consumers — the repo just landed and has no real-world consumers to break.

## Architecture overview

Three layers of change, ordered by leverage:

| Layer | Mechanism | Effect |
|---|---|---|
| **Block** | Rewrite `app-shell.tsx` in place | The chrome looks like real Workday product. |
| **Init** | `/canvasmith:init` scaffolds the shell into the root layout and emits a `lib/app-nav.ts` config | Every page is auto-shelled from project setup forward. |
| **Skill rules** | `canvas-ui`, `add`, `convert`, `component`, `audit` SKILL.md updates | Catches edge cases: post-init page additions, conversions, audits. |

## Section 1 — `app-shell` block redesign

**File:** `packages/ui/registry/canvasmith/blocks/app-shell.tsx` (rewrite in place).

### Layout

```
+--------------------------------------------------------------+
| [Brand chip]                            [Bell] [Inbox] [Avatar]|   <- header (~64 px)
+--------+-----------------------------------------------------+
|  Home  |                                                     |
|  Pers. |                                                     |
|  Fin.  |                                                     |
|  Proc. |                  {children}                         |
|  More  |                                                     |
|        |                                                     |
|        |                                                     |
| Saved  |                                                     |
| Sett.  |                                                     |
+--------+-----------------------------------------------------+
   ~80 px               flex: 1, overflow-y: auto
```

- Outer `Flex` column, `height: 100vh`, `overflow: hidden`.
- Header: `system.color.bg.default`, bottom border `system.color.border.divider`, soft depth shadow (`system.depth[1]`).
- Body row: `Flex`, `flex: 1`, `min-height: 0`.
- Rail: `Flex` column, fixed `width: 80px`, `flex-shrink: 0`, `justify-content: space-between` so primary nav sits at top and `footerNav` at bottom.
- Main: `<main>` element, `flex: 1`, `overflow-y: auto`, **no internal padding by default** so consumers can render full-bleed hero banners and decide their own page padding.

### Nav item rendering

- Icon centred above label.
- ~64 px tall hit target, ~64 px wide centred element inside the 80 px rail (so the active pill has 8 px of inset on each side).
- Label below icon: Canvas type token `system.type.subtext.medium`. Never set raw font-size.
- Active state: rounded square (`system.shape.x1`, `system.color.bg.primary.softer`) behind only the icon — not the whole row.
- Focus ring: signature Canvas double ring on `:focus-visible` (`box-shadow` inset + outset, mirrors the pattern already used in the existing `app-shell.tsx`).
- Renders `<a>` when `href` is provided, else `<button type="button">`. Always sets `aria-current="page"` when active.

### API

```ts
import type {CanvasSystemIcon} from '@workday/canvas-system-icons-web';

export interface AppShellNavItem {
  id: string;
  label: string;
  icon: CanvasSystemIcon;
  href?: string;
  onClick?: () => void;
}

export interface AppShellProps {
  /** Tenant brand element (logo + product name chip). Rendered top-left at ~32 px tall. */
  brand?: React.ReactNode;
  /** Primary rail items, rendered in the top group. */
  nav: AppShellNavItem[];
  /** Secondary rail items pinned to the bottom (e.g. Saved, Settings). */
  footerNav?: AppShellNavItem[];
  /** Currently-active nav item id. Compared against both `nav` and `footerNav`. */
  activeNavId?: string;
  /** Avatar element shown at the far right of the header. */
  avatar?: React.ReactNode;
  /** Overrides the default bell + inbox icon-button cluster. `avatar` is still appended after it. */
  headerActions?: React.ReactNode;
  /** Accessible name for the rail. Defaults to "Main navigation". */
  navAriaLabel?: string;
  /** Main content. */
  children: React.ReactNode;
}
```

### Breaking changes vs current `app-shell`

- `defaultExpanded` removed — rail is fixed, not collapsible.
- `navHeading` removed — no heading above the rail; matches Workday product chrome.
- Internal use of `SidePanel` / `useSidePanelModel` removed.
- Active-state visual changes from full-row to icon-only pill.
- Removes `padding: system.space.x8` from the main region — pages now own their padding.

Existing `dashboard` and `list-detail` blocks compose `app-shell` and assume a paddinged main region; see Section 3 for the matching touch-up.

## Section 2 — Init-level enforcement

**File:** `packages/canvasmith/.claude/skills/init/SKILL.md` and the files it generates.

### New Step 7.5 in `/canvasmith:init` (between current step 7 smoke-test and step 8 CANVAS.md)

1. **Install the `app-shell` block** into the consumer project using the existing `/canvasmith:add` flow (file copy + dep install). This places `components/canvasmith/app-shell.tsx` (or the consumer's aliased path).

2. **Write `lib/app-nav.ts`** with the default Workday-flavoured rail. Path follows the consumer's `components.json` `aliases.lib` when present, defaulting to `lib/`:

   ```ts
   import {
     homeIcon, userIcon, briefcaseIcon, cartIcon,
     dotsHorizontalIcon, bookmarkIcon, gearIcon,
   } from '@workday/canvas-system-icons-web';
   import type {AppShellNavItem} from '@/components/canvasmith/app-shell';

   export const primaryNav: AppShellNavItem[] = [
     {id: 'home',        label: 'Home',        icon: homeIcon,           href: '/'},
     {id: 'personal',    label: 'Personal',    icon: userIcon,           href: '/personal'},
     {id: 'finance',     label: 'Finance',     icon: briefcaseIcon,      href: '/finance'},
     {id: 'procurement', label: 'Procurement', icon: cartIcon,           href: '/procurement'},
     {id: 'more',        label: 'More',        icon: dotsHorizontalIcon, href: '/more'},
   ];

   export const footerNav: AppShellNavItem[] = [
     {id: 'saved',    label: 'Saved',    icon: bookmarkIcon, href: '/saved'},
     {id: 'settings', label: 'Settings', icon: gearIcon,     href: '/settings'},
   ];
   ```

   The import path uses the consumer's components alias resolved during the same install — same logic as the existing registry installer in the `add` skill.

3. **Mount the shell in the existing provider wrapper.** Per framework:

   - **Next App Router** — modify the `Providers` client wrapper (generated in step 5) so it renders the shell inside `<CanvasProvider>`:
     ```tsx
     'use client';
     import * as React from 'react';
     import {usePathname} from 'next/navigation';
     import {CanvasProvider} from '@workday/canvas-kit-react/common';
     import {AppShell} from '@/components/canvasmith/app-shell';
     import {primaryNav, footerNav} from '@/lib/app-nav';
     import './canvas-fonts';

     export function Providers({children}: {children: React.ReactNode}) {
       const pathname = usePathname();
       const activeNavId =
         [...primaryNav, ...footerNav].find(item => item.href === pathname)?.id;
       return (
         <CanvasProvider>
           <AppShell nav={primaryNav} footerNav={footerNav} activeNavId={activeNavId}>
             {children}
           </AppShell>
         </CanvasProvider>
       );
     }
     ```
     `app/layout.tsx` stays a Server Component — nothing changes there.

   - **Next Pages Router** — wrap `<Component {...pageProps} />` inside `<AppShell>` in `pages/_app.tsx`. Active-id resolution uses `useRouter().pathname`.

   - **Vite / CRA** — wrap the application root inside `<AppShell>` in `src/main.tsx` / `src/index.tsx`. Active-id resolution: if `react-router-dom` is a dependency, use `useLocation().pathname`; otherwise omit `activeNavId` and document in `CANVAS.md` that the consumer should pass it manually.

4. **Update the smoke-test page** so it renders content inside the shell (a `Heading` + `PrimaryButton` in the main region) rather than a bare button. Confirms shell + tokens + fonts together.

5. **Update the generated `CANVAS.md` template** with a new section:
   ```markdown
   ## App shell (mandatory chrome)
   - Every top-level view renders inside <AppShell> from components/canvasmith/app-shell.
   - Edit the rail in lib/app-nav.ts. Do not bypass the shell for prototypes.
   - To override per-page (e.g. an auth screen), render an alternate layout segment in Next App Router rather than hand-removing the shell.
   ```

6. **Update the "Quick gates after init (P0)" checklist** in the init skill:
   - [ ] AppShell mounted in the provider wrapper, sourced from `components/canvasmith/app-shell`.
   - [ ] `lib/app-nav.ts` exists and exports `primaryNav` + `footerNav`.
   - [ ] Smoke-test entry page renders content inside the shell main region.

## Section 3 — Skill rule propagation

For each skill, the change is a localised edit to its `SKILL.md`.

### `canvas-ui` (`packages/canvasmith/.claude/skills/canvas-ui/SKILL.md`)

Add a "Mandatory chrome" section near the top of the skill body:

> ### Mandatory chrome
> Every full-page view MUST render inside `<AppShell>` (the Workday chrome at `components/canvasmith/app-shell`). The default `/canvasmith:init` flow mounts this shell in the root provider, so most pages should not need to wrap themselves. If the project has no shell yet, treat that as a setup error — direct the user to run `/canvasmith:init` (which scaffolds it) before producing the page. Do **not** render an inner `<AppShell>` when one already wraps the layout — that produces nested chrome.

### `add` (`packages/canvasmith/.claude/skills/add/SKILL.md`)

Append to the "DO" list:

> - Before installing a full-page block (`dashboard`, `list-detail`), check whether the root layout already mounts `<AppShell>` (look for it in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`). If it does, the page block must emit its body **without** its own outer shell — do not double-shell.

### `convert` (`packages/canvasmith/.claude/skills/convert/SKILL.md`)

Append to the "DO" list:

> - If the file being converted represents a top-level page or screen (a default export from a route file, or a component with full-viewport layout), check whether the root layout already mounts `<AppShell>`. If yes: emit only the page body. If no: tell the user to run `/canvasmith:init` first; do not invent a shell.
> - For sub-components and primitives, never introduce `<AppShell>` — keep them shell-agnostic.

### `component` (`packages/canvasmith/.claude/skills/component/SKILL.md`)

Add a one-line guard near the top:

> This skill produces leaf components, not screens. Never include `<AppShell>` in output.

### `dashboard` and `list-detail` block updates

`packages/ui/registry/canvasmith/blocks/dashboard/page.tsx` and `packages/ui/registry/canvasmith/blocks/list-detail/page.tsx` currently render their own `<AppShell>` wrap. Refactor each to emit only the page body (`<PageHeader />` + stat-card grid + table for `dashboard`; `<PageHeader />` + `<DataTable />` + `<DetailDrawer />` for `list-detail`).

Keep `app-shell` listed in each block's `registryDependencies` so the shell component file still installs into `components/canvasmith/app-shell.tsx` — the root layout (set up by init) needs the file present even though the block body no longer renders `<AppShell>` itself. The block's page file simply does not import `AppShell`.

Also restore reasonable page padding inside each block (since `AppShell` no longer adds it): the page body's outermost wrapper takes `padding: system.space.x8`.

## Section 4 — Audit rule additions

**File:** `packages/canvasmith/.claude/skills/audit/SKILL.md`.

Add two new P0 rules to the punch-list section:

- **P0 — Un-shelled top-level page.** Any file matching `app/**/page.tsx`, `pages/**/*.tsx` (excluding `_app.tsx` and `_document.tsx`), or `src/routes/**/*.tsx` whose default-exported JSX root is not `<AppShell>` *and* whose root layout / `_app` / entry file does not mount `<AppShell>` either. Fix: ensure the root layout wraps in `<AppShell>` (preferred), or wrap the page itself.
- **P0 — Nested AppShell.** A page that renders `<AppShell>` when an ancestor (root layout, `_app.tsx`, `main.tsx`, `index.tsx`) already does. Fix: remove the inner shell.

Detection heuristic the audit skill should describe:

1. Grep for `from '@/components/canvasmith/app-shell'` (and alias-equivalents) across the project.
2. Look for that import inside `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx` — if present, the layout shells globally; flag any page that *also* imports it.
3. If not present in any of those files, every page file is expected to import and render `<AppShell>` itself — flag those that do not.

## Data flow

The shell does not own state. `activeNavId` is computed once per render in the provider wrapper from the framework router (`usePathname` / `useRouter` / `useLocation`) and passed down. Nav items declare `href` for routing; `onClick` is supported for client-side route guards or analytics but is not required.

## Error handling

- **Missing nav config.** If `lib/app-nav.ts` does not exist (e.g. consumer removed it), the provider wrapper falls back to an empty `nav={[]}` — the rail renders empty and the main region still shows children. No runtime crash.
- **Icon not found at import time.** `lib/app-nav.ts` imports system icons by name; if Canvas Kit changes an icon name in a future version, this surfaces as a TS error at consumer build time — fail-loud, easy to fix.
- **Path mismatch for active state.** When no item's `href` matches the current path, `activeNavId` is `undefined` and no item is highlighted — acceptable.

## Testing

This project has no test harness in `packages/ui/registry/canvasmith` (registry items are source-distributed, not built). Verification is manual + structural:

- **Structural:** in this repo's `apps/web` (the marketing/registry host site), import the rebuilt `AppShell` from the registry source and render a sample page. Confirm visually:
  - Rail is 80 px wide, items are icon-above-label, labels are visible at all times.
  - Active item has the rounded pill behind the icon only.
  - Header is white, brand left, bell + inbox + avatar right.
  - Focus ring appears on keyboard navigation through rail items.
  - Header + rail stay fixed; main scrolls.
- **A11y:** tab through the rail with keyboard; confirm focus ring, `aria-current="page"` on the active item, and `aria-label` on the side nav.
- **Block re-composition:** view `dashboard` and `list-detail` rendered inside the new shell — confirm no double-padding, no nested chrome, no broken layout.
- **Init verification:** run `/canvasmith:init` against a scratch Next App Router app and confirm the smoke-test page renders inside the new chrome with the default rail.

## Implementation order (handed to writing-plans)

1. Rewrite `packages/ui/registry/canvasmith/blocks/app-shell.tsx` per Section 1.
2. Refactor `dashboard` and `list-detail` blocks to drop their inner `<AppShell>` wrap and restore page padding.
3. Update each affected SKILL.md per Sections 2–4.
4. Update the init skill's generated layout/provider templates and `CANVAS.md` template.
5. Manually verify in `apps/web` per the Testing section.

## Risks

- **Active-state detection by `href` exact-match** is fragile for nested routes (`/finance/invoices` would not match `/finance`). Acceptable for the default — consumers with deep routing can pass `activeNavId` manually. Document this in `CANVAS.md`.
- **Vite/CRA without React Router** have no automatic active-state. Documented limitation — falls back to manual prop.
- **Consumers who genuinely don't want chrome** (e.g. an auth screen) need to opt out. In Next App Router this is handled with a route group / nested layout; document the pattern in `CANVAS.md`. Other frameworks: render the inner content conditionally based on path inside the provider wrapper.
