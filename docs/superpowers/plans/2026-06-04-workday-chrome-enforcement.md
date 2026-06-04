# Workday Chrome Enforcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Canvasmith `app-shell` block to match real Workday product chrome (fixed icon rail, stacked icon-above-label nav, pinned footer items, simplified top bar) and propagate enforcement so every Canvasmith-generated prototype is auto-shelled.

**Architecture:** Three layers of change. (1) Rewrite the `app-shell.tsx` registry block in place. (2) Update the `/canvasmith:init` skill so it scaffolds the shell into the consumer project's root provider and writes a `lib/app-nav.ts` nav config. (3) Update peer skills (`canvas-ui`, `add`, `convert`, `component`, `audit`) with rules that prevent un-shelled or double-shelled prototypes. The existing `dashboard` and `list-detail` blocks lose their own `<AppShell>` wrap since the layout now provides it; their `registryDependencies` still pull `app-shell` so the component file installs.

**Tech Stack:** TypeScript, React 18+, Next.js (App + Pages Router), Vite, CRA, `@workday/canvas-kit-react@15.0.6`, `@workday/canvas-kit-styling@15.0.6`, `@workday/canvas-tokens-web@4.3.0`, `@workday/canvas-system-icons-web@4.0.4`, `@emotion/react@^11`. Turborepo monorepo with `apps/web` (Next.js marketing site) and `packages/ui` (registry source).

**Spec:** `docs/superpowers/specs/2026-06-04-workday-chrome-enforcement-design.md`

---

## Task 1: Rewrite the `app-shell` block

**Files:**
- Modify (full rewrite): `packages/ui/registry/canvasmith/blocks/app-shell.tsx`

- [ ] **Step 1: Replace the entire file contents**

Open `packages/ui/registry/canvasmith/blocks/app-shell.tsx` and replace its full contents with the code below.

```tsx
'use client';

import * as React from 'react';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {notificationsIcon, inboxIcon} from '@workday/canvas-system-icons-web';
import type {CanvasSystemIcon} from '@workday/canvas-system-icons-web';

const shellStyles = createStyles({
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: system.color.bg.alt.softer,
});

const headerStyles = createStyles({
  flexShrink: 0,
  minHeight: '64px',
  paddingInline: system.space.x4,
  paddingBlock: system.space.x2,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x4,
  backgroundColor: system.color.bg.default,
  borderBlockEnd: `1px solid ${cssVar(system.color.border.divider)}`,
  boxShadow: system.depth[1],
  zIndex: 1,
});

const brandStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  minWidth: 0,
});

const headerActionsStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  flexShrink: 0,
});

const bodyStyles = createStyles({
  flex: 1,
  minHeight: 0,
});

const railStyles = createStyles({
  flexShrink: 0,
  width: '80px',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: system.color.bg.default,
  borderInlineEnd: `1px solid ${cssVar(system.color.border.divider)}`,
  paddingBlock: system.space.x3,
});

const railGroupStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: system.space.x1,
});

const navItemStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: system.space.x1,
  width: '64px',
  minHeight: '64px',
  border: 'none',
  background: 'transparent',
  borderRadius: system.shape.x1,
  color: system.color.fg.default,
  textDecoration: 'none',
  cursor: 'pointer',
  font: 'inherit',
  padding: system.space.x1,
  '&:hover .cnvs-nav-icon-bg': {
    backgroundColor: system.color.bg.alt.soft,
  },
  '&:focus-visible': {
    outline: '2px solid transparent',
    boxShadow: `inset 0 0 0 2px ${cssVar(
      system.color.border.input.inverse
    )}, 0 0 0 2px ${cssVar(system.color.border.input.inverse)}, 0 0 0 4px ${cssVar(
      system.color.border.primary.default
    )}`,
  },
});

const navIconBgStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: system.shape.x1,
  transition: 'background-color 120ms ease',
});

const navIconBgActiveStyles = createStyles({
  backgroundColor: system.color.bg.primary.softer,
});

const navLabelStyles = createStyles({
  ...system.type.subtext.medium,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '72px',
  textAlign: 'center',
});

const navLabelActiveStyles = createStyles({
  color: system.color.fg.primary.default,
  fontWeight: system.fontWeight.bold,
});

const mainStyles = createStyles({
  flex: 1,
  minWidth: 0,
  overflowY: 'auto',
  backgroundColor: system.color.bg.alt.softer,
});

/** A single navigation entry rendered in the fixed icon rail. */
export interface AppShellNavItem {
  /** Stable identifier used for active comparison and React keys. */
  id: string;
  /** Visible label rendered under the icon. */
  label: string;
  /** Leading Canvas system icon. */
  icon: CanvasSystemIcon;
  /** Renders an `<a>` with this href; otherwise a `<button>` is used. */
  href?: string;
  /** Click handler — fires for both link and button rendering. */
  onClick?: () => void;
}

export interface AppShellProps {
  /** Brand element rendered top-left (tenant logo / chip). */
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

function NavItem({item, isActive}: {item: AppShellNavItem; isActive: boolean}) {
  const iconBgClass = isActive
    ? `cnvs-nav-icon-bg ${navIconBgStyles} ${navIconBgActiveStyles}`
    : `cnvs-nav-icon-bg ${navIconBgStyles}`;
  const labelClass = isActive
    ? `${navLabelStyles} ${navLabelActiveStyles}`
    : navLabelStyles;

  const inner = (
    <>
      <span className={iconBgClass}>
        <SystemIcon
          icon={item.icon}
          size="sm"
          color={
            isActive ? system.color.icon.primary.default : system.color.icon.default
          }
        />
      </span>
      <span className={labelClass}>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={navItemStyles}
        aria-current={isActive ? 'page' : undefined}
        onClick={item.onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={navItemStyles}
      aria-current={isActive ? 'page' : undefined}
      onClick={item.onClick}
    >
      {inner}
    </button>
  );
}

/**
 * AppShell — Workday product chrome: top white header (brand + bell/inbox/avatar),
 * fixed 80px icon rail with stacked icon+label entries, and a scrollable main
 * region. The rail is intentionally not collapsible — it matches real Workday
 * product chrome 1:1.
 */
export const AppShell = ({
  brand,
  nav,
  footerNav,
  activeNavId,
  avatar,
  headerActions,
  navAriaLabel = 'Main navigation',
  children,
}: AppShellProps) => {
  const mainId = useUniqueId();
  const defaultActions = (
    <>
      <TertiaryButton icon={notificationsIcon} aria-label="Notifications" />
      <TertiaryButton icon={inboxIcon} aria-label="Inbox" />
    </>
  );

  return (
    <Flex cs={shellStyles} flexDirection="column">
      <Flex as="header" cs={headerStyles}>
        <Flex cs={brandStyles}>{brand}</Flex>
        <Flex cs={headerActionsStyles}>
          {headerActions ?? defaultActions}
          {avatar}
        </Flex>
      </Flex>

      <Flex cs={bodyStyles}>
        <Flex as="nav" aria-label={navAriaLabel} cs={railStyles}>
          <Box cs={railGroupStyles}>
            {nav.map(item => (
              <NavItem key={item.id} item={item} isActive={item.id === activeNavId} />
            ))}
          </Box>
          {footerNav && footerNav.length > 0 ? (
            <Box cs={railGroupStyles}>
              {footerNav.map(item => (
                <NavItem key={item.id} item={item} isActive={item.id === activeNavId} />
              ))}
            </Box>
          ) : null}
        </Flex>

        <Box as="main" id={mainId} cs={mainStyles}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppShell;
```

- [ ] **Step 2: Typecheck the apps/web workspace**

The `apps/web` workspace imports the registry source under `@/registry/canvasmith/...` and is the closest thing this repo has to a build/test harness. Run:

```bash
npm --workspace web run typecheck
```

Expected: PASS with no errors related to `app-shell.tsx`. If errors appear about `notificationsIcon` or `inboxIcon` not existing, see Step 3.

- [ ] **Step 3: If icon names don't resolve, substitute**

Open the icon index in `node_modules/@workday/canvas-system-icons-web/dist/es6/index.d.ts` (or wherever the type defs live in the consumer's installed copy) and confirm `notificationsIcon` and `inboxIcon` exist. If they don't, substitute with the closest existing icon names (Canvas Kit historically uses `notificationIcon` singular and `inboxIcon`; check both spellings). Update the two import names in `app-shell.tsx` to match and re-run Step 2.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/registry/canvasmith/blocks/app-shell.tsx
git commit -m "feat(app-shell): match real Workday product chrome

Rewrite app-shell in place: fixed 80px icon rail, stacked icon-above-label
entries with active-pill behind the icon only, simplified top bar with
default bell+inbox cluster and an avatar slot, pinned footerNav for Saved
and Settings items. Removes the collapsible SidePanel and the navHeading
and defaultExpanded props."
```

---

## Task 2: Update `registry.json` description for `app-shell`

**Files:**
- Modify: `packages/ui/registry.json` (the `app-shell` item, line ~184)

- [ ] **Step 1: Edit the description**

In `packages/ui/registry.json`, find the `app-shell` entry (search for `"name": "app-shell"`). Replace the `description` field value:

From:
```json
"description": "An application layout scaffold: top header, a collapsible Canvas SidePanel for navigation, and a main content region.",
```

To:
```json
"description": "Workday product chrome: top header (brand + actions + avatar), a fixed 80px icon rail with stacked icon+label nav and pinned footer items, and a scrollable main content region.",
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/registry.json
git commit -m "docs(registry): update app-shell description for Workday chrome"
```

---

## Task 3: Refactor the `dashboard` block to drop its own `<AppShell>` wrap

**Files:**
- Modify: `packages/ui/registry/canvasmith/blocks/dashboard/page.tsx`

- [ ] **Step 1: Remove the `AppShell` import and wrap**

Open `packages/ui/registry/canvasmith/blocks/dashboard/page.tsx`. Make four edits:

**1.** Remove the `AppShell` and `AppShellNavItem` import. Change:
```tsx
import {AppShell, type AppShellNavItem} from '@/registry/canvasmith/blocks/app-shell';
```
to (delete the line entirely).

**2.** Delete the constants that only existed to feed the shell:
- The `NAV_ITEMS` constant declaration (the `const NAV_ITEMS: AppShellNavItem[] = [...]` block).
- The `brandStyles` and `brandTitleStyles` `createStyles` calls.

Then prune the `@workday/canvas-system-icons-web` import list. Concretely:
- **Remove** `rocketIcon` (only used in the deleted brand) and `homeIcon` (only used in `NAV_ITEMS`).
- **Keep** `usersIcon`, `clipboardListIcon`, `calendarIcon`, `userIcon`, `exportIcon`, `plusIcon` — all six are still referenced by the remaining `<StatCard>` and action-button JSX.

Also delete the `UserMenu` import (`import {UserMenu} from '@/registry/canvasmith/ui/user-menu';`) — its only usage was inside the removed `headerActions` slot.

**3.** Add a page-padding wrapper style after the existing `tableSection` style:
```tsx
const pageStyles = createStyles({
  padding: system.space.x8,
});
```

**4.** Replace the JSX body. Find:
```tsx
return (
  <AppShell
    brand={...}
    nav={NAV_ITEMS}
    activeNavId="home"
    headerActions={...}
  >
    <PageHeader ... />
    <Grid cs={statGrid}>...</Grid>
    <Box cs={tableSection}>...</Box>
  </AppShell>
);
```
Replace with:
```tsx
return (
  <Box cs={pageStyles}>
    <PageHeader ... />
    <Grid cs={statGrid}>...</Grid>
    <Box cs={tableSection}>...</Box>
  </Box>
);
```
Keep the existing `<PageHeader>`, `<Grid>`, and `<Box cs={tableSection}>` content unchanged. Also remove the now-unused `UserMenu` import if `UserMenu` was only used in `headerActions`.

- [ ] **Step 2: Typecheck**

```bash
npm --workspace web run typecheck
```

Expected: PASS. If typecheck flags unused imports (`rocketIcon`, `UserMenu`, `homeIcon`, etc.), delete each one. Re-run until green.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/registry/canvasmith/blocks/dashboard/page.tsx
git commit -m "refactor(dashboard): drop inner AppShell, rely on root layout chrome

The root layout (set up by /canvasmith:init) now mounts AppShell globally,
so the dashboard block must emit only the page body to avoid nested
chrome. Adds a pageStyles wrapper with system.space.x8 padding that the
shell main region no longer provides."
```

---

## Task 4: Refactor the `list-detail` block to drop its own `<AppShell>` wrap

**Files:**
- Modify: `packages/ui/registry/canvasmith/blocks/list-detail/page.tsx`

- [ ] **Step 1: Remove the `AppShell` import and wrap**

Open `packages/ui/registry/canvasmith/blocks/list-detail/page.tsx`. Apply the same pattern as Task 3:

**1.** Remove the `AppShell` and `AppShellNavItem` import:
```tsx
import {AppShell, type AppShellNavItem} from '@/registry/canvasmith/blocks/app-shell';
```

**2.** Delete the constants that only existed to feed the shell:
- The `NAV_ITEMS` constant declaration.
- The `brandStyles` and `brandTitleStyles` `createStyles` calls.

Then prune the `@workday/canvas-system-icons-web` import list:
- **Remove** `homeIcon`, `clipboardListIcon` (only used in `NAV_ITEMS`), `rocketIcon` (only used in the deleted brand), and `userIcon` (only used inside the now-removed `UserMenu` `items`).
- **Keep** `userPlusIcon`, `editIcon`, `mailIcon` — all three are referenced by buttons in the remaining JSX.

Also delete the `UserMenu` import — its only usage was inside the removed `headerActions` slot.

**3.** Add a page-padding wrapper style:
```tsx
const pageStyles = createStyles({
  padding: system.space.x8,
});
```

**4.** Replace the JSX body. Find:
```tsx
return (
  <AppShell
    brand={...}
    nav={NAV_ITEMS}
    activeNavId="people"
    headerActions={...}
  >
    <PageHeader ... />
    <Flex cs={layout}>...</Flex>
  </AppShell>
);
```
Replace with:
```tsx
return (
  <Box cs={pageStyles}>
    <PageHeader ... />
    <Flex cs={layout}>...</Flex>
  </Box>
);
```
Keep the existing children unchanged.

- [ ] **Step 2: Typecheck**

```bash
npm --workspace web run typecheck
```

Expected: PASS. Delete any newly-unused imports the typechecker flags (`rocketIcon`, `UserMenu`, `homeIcon`, `clipboardListIcon` if only used in `NAV_ITEMS`).

- [ ] **Step 3: Commit**

```bash
git add packages/ui/registry/canvasmith/blocks/list-detail/page.tsx
git commit -m "refactor(list-detail): drop inner AppShell, rely on root layout chrome"
```

---

## Task 5: Update `/canvasmith:init` skill — add Step 7.5 (mount shell in providers)

**Files:**
- Modify: `packages/canvasmith/.claude/skills/init/SKILL.md`

- [ ] **Step 1: Insert the new "Step 7.5" section**

Open `packages/canvasmith/.claude/skills/init/SKILL.md`. Find the existing `### 7. Smoke-test the wiring` section (around line 142). **Before** it (between the `### 6.` Next App Router SSR registry section and the existing `### 7.`), insert the following new section:

```markdown
### 7. Install the AppShell chrome — mandatory wrapper

Every Canvasmith-produced prototype renders inside Workday product chrome. Mount the shell in the consumer's root provider so every page is auto-shelled from setup forward.

**Step 7a — Install the `app-shell` registry block** into the consumer project using the standard `/canvasmith:add app-shell` flow (file copy + dep install). The block lands at the consumer's `aliases.components` path, defaulting to `components/canvasmith/app-shell.tsx`.

**Step 7b — Write `lib/app-nav.ts`** (or the path resolved by `aliases.lib`):

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

If any of the icon names above are not present in the installed `@workday/canvas-system-icons-web` version, substitute with the nearest available icon and note the substitution in `CANVAS.md`.

**Step 7c — Mount AppShell in the provider wrapper.**

- **Next App Router** — modify the `Providers` client wrapper created in step 5 so it renders the shell inside `<CanvasProvider>`. Replace the body of `app/providers.tsx` with:

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

- **Next Pages Router** — wrap `<Component {...pageProps} />` inside `<AppShell>` in `pages/_app.tsx`. Resolve the active id from `useRouter().pathname`.

- **Vite / CRA** — wrap the application root inside `<AppShell>` in `src/main.tsx` / `src/index.tsx`. If `react-router-dom` is a dependency, resolve the active id from `useLocation().pathname`; otherwise omit `activeNavId` and note in `CANVAS.md` that the consumer should pass it manually per route.
```

- [ ] **Step 2: Renumber the existing Step 7 to Step 8 and Step 8 to Step 9**

In the same file, after the inserted section:
- Find `### 7. Smoke-test the wiring` → change to `### 8. Smoke-test the wiring (inside the shell)`.
- Find `### 8. Write \`CANVAS.md\` at the project root` → change to `### 9. Write \`CANVAS.md\` at the project root`.

Then in the new Step 8 (smoke-test), replace its existing example with a shell-aware version. Replace the code block:

```tsx
'use client';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
export default function Page() {
  return <PrimaryButton>Hello Canvas</PrimaryButton>;
}
```

with:

```tsx
'use client';
import * as React from 'react';
import {Box} from '@workday/canvas-kit-react/layout';
import {Heading} from '@workday/canvas-kit-react/text';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const pageStyles = createStyles({padding: system.space.x8});

export default function Page() {
  return (
    <Box cs={pageStyles}>
      <Heading as="h1" size="medium">Hello Canvas</Heading>
      <PrimaryButton>Primary action</PrimaryButton>
    </Box>
  );
}
```

Below the code block, update the success criterion description from "A blue Roboto pill button confirms success." to: "A page rendered inside the Workday chrome (top header + 80px icon rail with the default nav) showing a Heading and a PrimaryButton confirms success."

- [ ] **Step 3: Commit**

```bash
git add packages/canvasmith/.claude/skills/init/SKILL.md
git commit -m "feat(init): scaffold AppShell into root provider as mandatory chrome

Adds Step 7 (install app-shell, write lib/app-nav.ts, mount in the
Providers wrapper for Next App Router / Pages Router / Vite / CRA),
renumbers the existing smoke-test and CANVAS.md steps, and updates the
smoke-test entry page to render inside the shell."
```

---

## Task 6: Update `/canvasmith:init` — extend P0 gates and CANVAS.md template

**Files:**
- Modify: `packages/canvasmith/.claude/skills/init/SKILL.md`

- [ ] **Step 1: Extend the "Quick gates after init (P0)" checklist**

Open `packages/canvasmith/.claude/skills/init/SKILL.md`. Find the `## Quick gates after init (P0)` section. Append three new checklist items at the end of the list (after the existing `CANVAS.md exists` line):

```markdown
- [ ] AppShell mounted in the provider wrapper, sourced from `components/canvasmith/app-shell`.
- [ ] `lib/app-nav.ts` exists and exports `primaryNav` + `footerNav`.
- [ ] Smoke-test entry page renders content inside the shell main region (visible top header + 80px rail).
```

- [ ] **Step 2: Add an "App shell" section to the CANVAS.md template**

In the same file, find the `## CANVAS.md template (write this to the project root)` section. Inside the embedded markdown template (the block between the triple-backtick markers), insert a new `## App shell (mandatory chrome)` section between the existing `## Brand / theme tokens` section and `## Components in use` section. Insert exactly:

```markdown
## App shell (mandatory chrome)
- Every top-level view renders inside <AppShell> from `components/canvasmith/app-shell`.
- Edit the rail in `lib/app-nav.ts` (export `primaryNav` and `footerNav`).
- Do not bypass the shell for prototypes. To opt out for a specific route (e.g. an auth screen), render an alternate layout segment in Next App Router rather than hand-removing the shell.
- Active state matches by exact `href` against the current pathname. For nested routes that should highlight the parent item, pass `activeNavId` manually to <AppShell>.
```

- [ ] **Step 3: Commit**

```bash
git add packages/canvasmith/.claude/skills/init/SKILL.md
git commit -m "feat(init): extend P0 gates and CANVAS.md template with chrome rules"
```

---

## Task 7: Update `canvas-ui` skill — add "Mandatory chrome" rule

**Files:**
- Modify: `packages/canvasmith/.claude/skills/canvas-ui/SKILL.md`

- [ ] **Step 1: Read the file to find the right insertion point**

```bash
head -80 packages/canvasmith/.claude/skills/canvas-ui/SKILL.md
```

Find the first `## ` (level-2) section heading after the frontmatter. The new section will go immediately before it.

- [ ] **Step 2: Insert the rule**

After the frontmatter closing `---` and any introductory paragraph, before the first `## ` heading, insert:

```markdown
## Mandatory chrome — every page renders inside <AppShell>

Every full-page view this skill produces MUST render inside `<AppShell>` (Workday product chrome at `components/canvasmith/app-shell`). The default `/canvasmith:init` flow mounts this shell in the root provider, so most pages render their own body **without** their own `<AppShell>` wrap — the layout provides it.

- If the project has `<AppShell>` in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`: emit the page body only. Never render a nested `<AppShell>`.
- If the project does **not** mount `<AppShell>` anywhere: treat that as a setup error. Tell the user to run `/canvasmith:init` (which scaffolds the shell) before producing the page. Do not invent your own shell.
- Leaf components and primitives are shell-agnostic — never include `<AppShell>` in their output.
```

- [ ] **Step 3: Commit**

```bash
git add packages/canvasmith/.claude/skills/canvas-ui/SKILL.md
git commit -m "feat(canvas-ui): require pages to render inside AppShell chrome"
```

---

## Task 8: Update `add` skill — DO list note

**Files:**
- Modify: `packages/canvasmith/.claude/skills/add/SKILL.md`

- [ ] **Step 1: Append to the DO list**

Open `packages/canvasmith/.claude/skills/add/SKILL.md`. Find the `**DO**` block in the `## DO / DON'T` section near the bottom. Insert a new bullet at the end of the DO list:

```markdown
- Before installing a full-page block (`dashboard`, `list-detail`), check whether the root layout already mounts `<AppShell>` (look in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`). If it does, the page block emits its body **without** rendering `<AppShell>` itself — keep `app-shell` in the block's `registryDependencies` so the component file still installs for the layout to import.
```

- [ ] **Step 2: Commit**

```bash
git add packages/canvasmith/.claude/skills/add/SKILL.md
git commit -m "feat(add): note AppShell wrap handling for full-page blocks"
```

---

## Task 9: Update `convert` skill — DO list notes

**Files:**
- Modify: `packages/canvasmith/.claude/skills/convert/SKILL.md`

- [ ] **Step 1: Append to the DO list**

Open `packages/canvasmith/.claude/skills/convert/SKILL.md`. Find the `**DO**` block in the `## DO / DON'T` section. Insert these two bullets at the end of the DO list:

```markdown
- If the file being converted is a top-level page or screen (a default export from a route file, or a component with full-viewport layout), check whether the root layout already mounts `<AppShell>`. If yes: emit only the page body. If no: tell the user to run `/canvasmith:init` first; never invent a shell from raw markup.
- For sub-components and primitives, never introduce `<AppShell>` — keep them shell-agnostic.
```

- [ ] **Step 2: Commit**

```bash
git add packages/canvasmith/.claude/skills/convert/SKILL.md
git commit -m "feat(convert): clarify AppShell handling for pages vs primitives"
```

---

## Task 10: Update `component` skill — leaf-component guard

**Files:**
- Modify: `packages/canvasmith/.claude/skills/component/SKILL.md`

- [ ] **Step 1: Add a guard line near the top of the skill body**

Open `packages/canvasmith/.claude/skills/component/SKILL.md`. After the frontmatter closing `---` and the first `# /canvasmith:component` heading + intro paragraph, before the first major content section, insert:

```markdown
> **Scope:** This skill produces leaf components, not screens. Never include `<AppShell>` in output — the root layout already provides the chrome, and a nested shell breaks the page.
```

- [ ] **Step 2: Commit**

```bash
git add packages/canvasmith/.claude/skills/component/SKILL.md
git commit -m "feat(component): forbid AppShell in leaf-component output"
```

---

## Task 11: Update `audit` skill — add two P0 rules

**Files:**
- Modify: `packages/canvasmith/.claude/skills/audit/SKILL.md`

- [ ] **Step 1: Locate the P0 rules section**

```bash
head -120 packages/canvasmith/.claude/skills/audit/SKILL.md
```

Find the section that lists P0 issues (look for `## P0` or a heading like "Priority 0" / "Critical issues"). If the file does not use explicit P0/P1/P2/P3 headings yet, find the bullet list of audit rules at the top.

- [ ] **Step 2: Insert the two new P0 rules**

In the P0 section (or equivalent), insert these two new rules at the start of the list (so they audit first):

```markdown
- **P0 — Un-shelled top-level page.** Any file matching `app/**/page.tsx`, `pages/**/*.tsx` (excluding `_app.tsx` and `_document.tsx`), or `src/routes/**/*.tsx` whose default-exported JSX root is not `<AppShell>` **and** whose root layout / `_app` / entry file does not mount `<AppShell>` either. Fix: ensure the root layout wraps `{children}` in `<AppShell>` (preferred — usually means re-running `/canvasmith:init`), or wrap the offending page itself in `<AppShell>`.
- **P0 — Nested AppShell.** A page that renders `<AppShell>` when an ancestor (`app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`) already does. Fix: remove the inner shell so only the layout-level shell remains.
```

- [ ] **Step 3: Add the detection heuristic**

After the new rules, add the following paragraph (or extend the existing detection guidance the skill uses):

```markdown
**Detection heuristic for AppShell rules:**
1. Grep the project for `from '@/components/canvasmith/app-shell'` (and alias-equivalent paths the consumer may use).
2. If a hit appears in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`, the layout shells globally. Flag any **page** file that also imports `AppShell` (nested-shell P0).
3. If no hit appears in any of those entry files, every page is expected to import and render `<AppShell>` itself. Flag any page that does not (un-shelled P0).
```

- [ ] **Step 4: Commit**

```bash
git add packages/canvasmith/.claude/skills/audit/SKILL.md
git commit -m "feat(audit): add P0 rules for un-shelled and nested AppShell"
```

---

## Task 12: Visual verification in `apps/web`

**Files:**
- No file changes — manual verification only.

- [ ] **Step 1: Boot the dev server**

```bash
npm run web
```

Expected: the marketing site starts on `http://localhost:3000` (or the next available port). Wait for the "Ready" log line.

- [ ] **Step 2: Render the dashboard block in a scratch route**

The `apps/web` site does not import the dashboard page directly today. Create a temporary route to render it inside a sample shell. Add a new file `apps/web/app/_test/dashboard/page.tsx`:

```tsx
'use client';
import * as React from 'react';
import {CanvasProvider} from '@workday/canvas-kit-react/common';
import {
  homeIcon, userIcon, briefcaseIcon, cartIcon,
  dotsHorizontalIcon, bookmarkIcon, gearIcon,
} from '@workday/canvas-system-icons-web';
import {AppShell, type AppShellNavItem} from '@/registry/canvasmith/blocks/app-shell';
import DashboardPage from '@/registry/canvasmith/blocks/dashboard/page';

const primaryNav: AppShellNavItem[] = [
  {id: 'home',        label: 'Home',        icon: homeIcon,           href: '#home'},
  {id: 'personal',    label: 'Personal',    icon: userIcon,           href: '#personal'},
  {id: 'finance',     label: 'Finance',     icon: briefcaseIcon,      href: '#finance'},
  {id: 'procurement', label: 'Procurement', icon: cartIcon,           href: '#procurement'},
  {id: 'more',        label: 'More',        icon: dotsHorizontalIcon, href: '#more'},
];

const footerNav: AppShellNavItem[] = [
  {id: 'saved',    label: 'Saved',    icon: bookmarkIcon, href: '#saved'},
  {id: 'settings', label: 'Settings', icon: gearIcon,     href: '#settings'},
];

export default function TestShellPage() {
  return (
    <CanvasProvider>
      <AppShell nav={primaryNav} footerNav={footerNav} activeNavId="home">
        <DashboardPage />
      </AppShell>
    </CanvasProvider>
  );
}
```

If any icon names from `lib/app-nav.ts` defaults don't resolve, swap them for the closest match and update the canonical list back in `Task 5 Step 1b`.

- [ ] **Step 3: Visit the test route and verify each gate**

Open `http://localhost:3000/_test/dashboard` and verify all of:

- [ ] Rail is fixed ~80 px wide; never scrolls or resizes; no toggle button.
- [ ] Each rail item shows the icon centred above the label; label is visible at all times.
- [ ] Active item (`home`) shows a soft rounded square behind only the icon, not the full row.
- [ ] `Saved` and `Settings` items are pinned to the bottom of the rail with a visible gap above them.
- [ ] Header is white, ~64 px tall, with the bell + inbox icon-button cluster on the right (because no `avatar` prop is passed, no avatar appears — that's expected).
- [ ] Dashboard content (PageHeader → stat-card grid → table) renders in the main region with visible spacing on all sides (no flush-to-edge content).
- [ ] No double chrome (no inner header bar, no inner sidebar).
- [ ] Tab through the rail with the keyboard — every rail item gets the signature Canvas double-ring focus outline on `:focus-visible`.

- [ ] **Step 4: Also verify list-detail**

Add a second test route at `apps/web/app/_test/list-detail/page.tsx` mirroring Step 2 but importing `ListDetailPage` from `@/registry/canvasmith/blocks/list-detail/page` instead of `DashboardPage`. Visit `http://localhost:3000/_test/list-detail` and confirm:

- [ ] Master table renders with spacing (page padding from `pageStyles` in the refactored block applies).
- [ ] Clicking a row opens the detail drawer over the rail-aware shell without overlapping the rail.
- [ ] No nested chrome.

- [ ] **Step 5: Remove the scratch routes**

```bash
rm -rf apps/web/app/_test
```

(Use `git clean -fd apps/web/app/_test` on systems where `rm -rf` is unavailable.)

- [ ] **Step 6: Final typecheck**

```bash
npm run typecheck
```

Expected: PASS across all workspaces.

- [ ] **Step 7: Commit any test-related deletions** (the scratch routes were never committed, so this should be a no-op — confirm with `git status`):

```bash
git status
```

If `git status` shows uncommitted changes from this verification task, decide whether to commit them. If clean: done.

---

## Self-Review

**1. Spec coverage:**
- Section 1 (visual + API redesign) → Task 1, Task 2.
- Section 2 (init enforcement: app-shell install + lib/app-nav.ts + provider mount + smoke test + CANVAS.md) → Task 5, Task 6.
- Section 3 (skill rule propagation: canvas-ui, add, convert, component + block touch-ups) → Tasks 3, 4, 7, 8, 9, 10.
- Section 4 (audit P0 rules) → Task 11.
- Testing section (manual verification in apps/web) → Task 12.

All sections covered.

**2. Placeholder scan:** No TBDs, TODOs, "implement later", or "similar to Task N" references. Every step shows the exact code or command.

**3. Type consistency:** `AppShellNavItem` shape is identical in Task 1 (block source) and Task 5 (lib/app-nav.ts template) and Task 12 (test route). `AppShellProps` matches the spec. The block's import alias (`@/registry/canvasmith/blocks/app-shell` inside the registry source, `@/components/canvasmith/app-shell` in consumer projects after install) is consistent.

**4. Known fragility called out in Risks (spec):** icon name resolution — Task 1 Step 3 and Task 12 Step 2 both have a fallback procedure if a default icon name doesn't exist in the installed Canvas Kit version.
