---
name: canvas-ui
description: Make any AI-generated React/Next.js front-end look and feel Workday-native using REAL Workday Canvas Kit. Use this skill WHENEVER the user builds, designs, restyles, refactors, or "Workday-ifies" a front-end component, screen, page, dashboard, form, or app — and whenever generated UI must match Workday Canvas. Grounds every output in real @workday/canvas-kit-react components, Canvas Design Tokens (cssVar(system.*)), createStencil, Roboto, and Workday styling/a11y conventions instead of hand-rolled HTML/CSS.
license: MIT
---

You are building UI that must be indistinguishable from a real Workday product. Generic, framework-default, or "AI-slop" front-ends are a defect here — Workday users expect Canvas. This skill makes any React/Next.js UI **Workday-native** by grounding it in **real Canvas Kit**: real components, real Canvas Design Tokens, real stencils, real Roboto, real focus and a11y behavior. Never approximate Canvas — use it.

## Mandatory chrome — every page renders inside <AppShell>

Every full-page view this skill produces MUST render inside `<AppShell>` (Workday product chrome at `components/canvasmith/app-shell`). The default `/canvasmith:init` flow mounts this shell in the root provider, so most pages render their own body **without** their own `<AppShell>` wrap — the layout provides it.

- If the project has `<AppShell>` in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`: emit the page body only. Never render a nested `<AppShell>`.
- If the project does **not** mount `<AppShell>` anywhere: treat that as a setup error. Tell the user to run `/canvasmith:init` (which scaffolds the shell) before producing the page. Do not invent your own shell.
- Leaf components and primitives are shell-agnostic — never include `<AppShell>` in their output.

## What "Workday-native" means

A Workday-native UI is built from the **actual Workday Canvas system**, not a look-alike:

- **Real components.** Every interactive element is a `@workday/canvas-kit-react` component (`PrimaryButton`, `FormField`, `TextInput`, `Select`, `Table`, `Modal`, `Tabs`, `Card`, …) or a vetted Canvasmith block — never a raw `<button>`/`<input>` styled to resemble one.
- **Real tokens.** Every color, space, radius, shadow, and type value comes from Canvas tokens via `cssVar(system.*)` / token objects — never a literal hex or px.
- **Roboto, always.** Type is Roboto (`system.fontFamily.default`) at Canvas type scales (`system.type.*`), loaded through `@workday/canvas-kit-react-fonts`.
- **Canvas iconography.** Icons are `SystemIcon` + `@workday/canvas-system-icons-web` — never emoji or improvised SVGs.
- **Canvas behavior & a11y.** Inputs are wrapped in `FormField`; overlays trap focus; focus rings are visible; everything is keyboard-operable. Canvas builds this in — keep it.
- **Calm, enterprise composition.** Blueberry-blue primary, generous whitespace on the 4px/8px space scale, depth-1 cards, restrained hierarchy. Confident, not flashy.

The blueberry primary action blue is `system.color.bg.primary.default` (the Canvas value behind "Workday blue," legacy hex `#0875E1`). Reach for the **token**, not the hex.

## The decision hierarchy (follow in order, every time)

For ANY UI need, work top-down and stop at the first level that fits. Lower levels are progressively less deterministic — never skip ahead to hand-rolling.

**1. Add a vetted Canvasmith registry block — `/canvasmith:add BLOCK`** *(most deterministic)*
If a registry block fits the need (login screen, data table with toolbar, settings form, page header, empty state, nav shell, etc.), add it. Blocks are pre-vetted, real-Canvas, token-correct, and a11y-complete — the fastest path to Workday-native and the least room for drift. See `reference/blocks.md` for the catalog. *(The registry ships from the Canvasmith registry step; until then, treat blocks as compositions you assemble per level 2.)*

**2. Compose real Canvas Kit primitives + Canvas tokens** *(default for everything else)*
No block fits → build it from `@workday/canvas-kit-react` components arranged with `Box`/`Flex`/`Grid`, styled only with Canvas tokens through the `cs` prop and `createStyles`. This is where most work lives. Pick the right component (`reference/components.md`), wire forms with `FormField`, lay out on the space scale, and apply tokens (`reference/tokens.md`). Do **not** drop to level 3 just to restyle — the `cs` prop covers overrides.

**3. Author a new component with `createStencil` — `/canvasmith:component`** *(last resort)*
Only when nothing in Canvas Kit fits the primitive you need. Build it in the Canvas idiom: a module-scope `createStencil` (`vars`/`base`/`modifiers`/`compound`/`parts`), wrapped in `createComponent('element')({displayName, Component})`, merged with `handleCsProp`, valued entirely from tokens. Export the stencil so it composes via `extends`. See `reference/styling.md`.

> **NEVER hand-roll generic HTML/CSS.** A styled `<div>`/`<button>`/`<input>` with hardcoded values is the failure mode this skill exists to prevent. If you're writing raw CSS values, you've left the hierarchy — go back up.

## The Workday-native test

Before considering any UI done, ask:

> **Would a Workday product designer believe this shipped from their own team?**

If they'd instantly clock it as "an AI made this" or "this isn't Canvas," it fails. Tells that fail the test:
- A button/input that isn't a Canvas component (wrong focus ring, wrong radius, wrong hover).
- A color or spacing that isn't on a Canvas token (slightly-off blue, 15px padding, 10px radius).
- Emoji or a random icon instead of a Canvas system icon.
- Roboto missing — type falls back to system/Arial/Inter.
- An input with no label wiring (no `FormField`), or an overlay you can't escape with the keyboard.
- A purple→blue gradient, neon-on-dark, glassmorphism — none of which are Canvas.

A passing UI makes the designer ask "which team built this?" — not "which AI?"

## DO / DON'T

**DO**
- DO route every need through the decision hierarchy: block → Canvas primitive → stencil.
- DO use Canvas tokens for ALL values: colors `cssVar(system.color.*)`, spacing `system.space.x*` (4px scale; `x4` = 16px), radius `system.shape.*`, elevation `system.depth[1..6]`, type `system.type.*`.
- DO use Roboto via `system.fontFamily.default`, injected by `@workday/canvas-kit-react-fonts`.
- DO use `SystemIcon` + named icons from `@workday/canvas-system-icons-web`.
- DO wrap every input in `FormField` (`FormField.Label` + `FormField.Input as={...}` + `FormField.Hint`) so labels, `aria-describedby`, and error state are wired. (`Select` is the exception — it wraps `FormField`.)
- DO keep visible focus rings and full keyboard operability — Canvas provides them; never strip them.
- DO apply overrides through the `cs` prop with `createStyles`/stencil output (not inline style objects, which forfeit static-styling perf).
- DO prefer Preview components where main is deprecated: `Switch`, `StatusIndicator`, class-based `RadioGroup`, `AccentIcon` → `@workday/canvas-kit-preview-react/*`.
- DO start every Canvas-using file with `'use client'` (Canvas styles inject at import time — see `reference/setup.md`).

**DON'T**
- DON'T hardcode hex or px (`#0875E1`, `color: blue`, `padding: 16px`, `border-radius: 10px`). Use the token.
- DON'T invent spacing/radii off the scale (no `13px`, no `6px` radius unless it's `system.shape.x1Half`).
- DON'T use emoji or improvised inline SVG as icons.
- DON'T pull in non-Canvas UI libraries (MUI, shadcn/Radix, Chakra, Bootstrap, Ant) or Tailwind utility styling for the UI surface — Canvas Kit is the system.
- DON'T hand-roll a generic `<button>`/`<input>`/`<div>` card when a Canvas component or block exists.
- DON'T strip outlines (`outline: none`) or remove focus styling.
- DON'T use AI-slop aesthetics — purple/blue gradients, neon-on-dark, glassmorphism, gradient text. Canvas is calm and enterprise.
- DON'T pass raw style objects to `cs` as the primary styling path (runtime-merged; use `createStyles`/`createStencil`).
- DON'T theme via a JS theme prop — theming is the four token CSS imports + `CanvasProvider`.

## Reference map

Pull the matching reference into context for any non-trivial task. Each is dense and self-contained:

- **`reference/setup.md`** — Project setup: pinned `npm install`, the FOUR token CSS imports, Roboto via `@workday/canvas-kit-react-fonts`, `CanvasProvider`, the full Next.js 15 App Router Emotion SSR registry (`getCache` + `createEmotionServer` + `useServerInsertedHTML`), Vite/CRA notes, and the `'use client'` rule. **Read first when wiring up a project** (or run `/canvasmith:init`).
- **`reference/tokens.md`** — Canvas Design Tokens: color/space/shape/depth/type/opacity, real token paths (`system.color.bg.primary.default`, `system.space.x4`, …), `cssVar`, `px2rem`, `calc.*`, `colorSpace.*`. *(`/canvasmith:tokens` maps raw values to the nearest token.)*
- **`reference/components.md`** — The Canvas Kit React component catalog: imports, props, sub-components, and the compound/model pattern (buttons, forms, layout, nav, overlays, data, content). *(`/canvasmith:docs COMPONENT` pulls a single component's real prop table.)*
- **`reference/styling.md`** — The styling engine: `createStyles`, `createStencil` (`vars`/`base`/`modifiers`/`compound`/`parts`/`extends`), `createVars`, the `cs` prop, `handleCsProp`, and `createComponent`. *(`/canvasmith:component` scaffolds a new stencil-based component.)*
- **`reference/patterns.md`** — Composed Workday screen patterns: forms, tables with toolbars, page headers, modals/dialogs, nav shells, empty/loading states. *(`/canvasmith:build SCREEN` generates a full screen.)*
- **`reference/accessibility.md`** — A11y conventions: `FormField` wiring, `aria-label` requirements (icon buttons, `*.CloseIcon`, Breadcrumbs, Pagination), focus management for overlays, keyboard support, color-contrast tokens. *(`/canvasmith:audit` flags P0–P3 issues.)*
- **`reference/icons.md`** — `SystemIcon`, `@workday/canvas-system-icons-web` named icons, sizing (`system`/`component` icon tokens), color via `systemIconStencil` vars, and decorative-vs-meaningful labeling.
- **`reference/blocks.md`** — The Canvasmith registry block catalog: what's available, what each composes, and when to `/canvasmith:add` vs. compose by hand. *(Catalog ships from the Canvasmith registry step.)*

## Related commands

When the user invokes them, these scoped skills do focused work — but this skill's hierarchy and DO/DON'T govern all of them:

- `/canvasmith:init` — detect stack, install/pin Canvas Kit, wire tokens + Roboto + `CanvasProvider` + SSR, write `CANVAS.md`.
- `/canvasmith:build SCREEN` — generate a full screen from real components + blocks + tokens.
- `/canvasmith:add BLOCK` — add a vetted registry block (decision hierarchy level 1).
- `/canvasmith:convert` — refactor existing AI UI onto Canvas Kit + `cssVar()` tokens.
- `/canvasmith:tokens` — map raw colors/spacing to the nearest Canvas token.
- `/canvasmith:component` — scaffold a new `createStencil` component (decision hierarchy level 3).
- `/canvasmith:audit` — flag off-brand color, non-token spacing, wrong radius, missing focus/a11y (P0–P3).
- `/canvasmith:docs COMPONENT` — pull a component's real prop table + usage into context.

## Quick canonical shape

What level-2 composition looks like — real component, tokens via `cs`, `FormField` wiring, Canvas icon:

```tsx
'use client';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {Flex} from '@workday/canvas-kit-react/layout';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {plusIcon} from '@workday/canvas-system-icons-web';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

// styles at MODULE SCOPE (never inside render) — tokens auto-wrapped to var(--cnvs-...)
const cardStyles = createStyles({
  padding: system.space.x6,                      // 24px
  borderRadius: system.shape.x2,                 // 8px
  boxShadow: system.depth[1],                    // card elevation
  backgroundColor: system.color.bg.default,
  color: cssVar(system.color.fg.default),
});

export function AddTeammate() {
  return (
    <Flex flexDirection="column" gap={system.space.x4} cs={cardStyles}>
      <FormField isRequired>
        <FormField.Label>Email</FormField.Label>
        <FormField.Input as={TextInput} type="email" placeholder="you@acme.com" />
        <FormField.Hint>We'll send an invite.</FormField.Hint>
      </FormField>
      <PrimaryButton icon={plusIcon}>Add teammate</PrimaryButton>
      {/* Canvas icon, never emoji: */}
      <SystemIcon icon={plusIcon} color={system.color.icon.soft} aria-hidden />
    </Flex>
  );
}
```

Every value is a token. Every control is Canvas. That's Workday-native.
