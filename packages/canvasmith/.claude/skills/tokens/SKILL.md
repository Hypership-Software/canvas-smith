---
name: tokens
description: Map raw colors, spacing, and radius in code to the nearest real Workday Canvas design token. Invoke for /canvasmith:tokens — scans files for hex/rgb colors, px/rem spacing, and border-radius values, then rewrites each as a cssVar(system.*) token (e.g. #0875e1 -> system.color.bg.primary.default, 16px -> system.space.x4, 8px radius -> system.shape.x2). Use when a user asks to "tokenize", "map colors to tokens", "replace hex values", or "use Canvas tokens" in existing UI.
user-invokable: true
license: MIT
args:
  - name: target
    description: File, directory, or glob to tokenize (e.g. "src/components/Card.tsx" or "src/**/*.tsx"). Defaults to the current working directory / changed files.
    required: false
---

# /canvasmith:tokens — map raw values to Canvas tokens

Replace hard-coded colors, spacing, and radii with the nearest **real** `@workday/canvas-tokens-web@4.3.0` token, consumed via `cssVar()` from `@workday/canvas-kit-styling`. This is a surgical, value-level pass — it does NOT swap component libraries (that is `/canvasmith:convert`) and does NOT flag issues without fixing them (that is `/canvasmith:audit`).

**Token system (this is the only one to emit):** three layers — `base` (palette) -> `brand` (themeable) -> `system` (semantic). **Prefer `system.*` for everything.** JS token objects stringify to CSS-var names (e.g. `system.color.bg.primary.default` -> `--cnvs-sys-color-bg-primary-default`); wrap them in `cssVar(...)` -> `var(--cnvs-sys-color-bg-primary-default)`. Base unit = `0.25rem` = 4px.

Full value tables (verified hex/rem/px, every token path) live in **`../canvas-ui/reference/tokens.md`** — consult it before emitting any mapping. The summary below is the working cheat sheet.

## Workflow

1. **Resolve scope.** If `target` is given, scan it; otherwise scan changed files (git diff) or ask. Only touch `.ts/.tsx/.css/.scss/.js/.jsx` and styled/`cs`/`createStyles`/`createStencil` blocks.
2. **Confirm setup.** Mappings only render if the four token CSS files are imported once at the app root:
   ```ts
   import '@workday/canvas-tokens-web/css/base/_variables.css';
   import '@workday/canvas-tokens-web/css/brand/_variables.css';
   import '@workday/canvas-tokens-web/css/system/_variables.css';
   import '@workday/canvas-tokens-web/css/component/_variables.css';
   ```
   If missing, note it and recommend `/canvasmith:init`.
3. **Detect raw values** — hex (`#0875e1`, `#fff`), `rgb()/rgba()/hsl()`, named CSS colors, `px`/`rem`/`em` lengths used for spacing (padding, margin, gap, inset), and `border-radius` lengths.
4. **Map each to the nearest token** using the methodology + tables below.
5. **Rewrite.** In JS/TS style objects emit `cssVar(system.…)` and add `import {cssVar} from '@workday/canvas-kit-styling'` + `import {system} from '@workday/canvas-tokens-web'` if absent. In plain CSS emit the `var(--cnvs-sys-…)` form.
6. **Report** a mapping table: `value -> token (cssVar) | confidence | file:line`. Flag any value with no clean match (see "No clean match").

## Mapping methodology

- **Semantic first.** Choose the token by *role*, not by raw closeness. A blue used as a button fill -> `system.color.bg.primary.default`; the same blue used as link/icon text -> `system.color.fg.primary.default`; as a focus ring/border -> `system.color.border.primary.default`. Read the surrounding CSS property to pick the right group (`bg` / `fg` / `border` / `icon`).
- **Snap spacing to the 4px scale.** Round to the nearest `system.space.*` step. Exact hits are high-confidence; a value between steps snaps to the closest and is flagged medium-confidence. For true in-between needs, use `calc.add/subtract/multiply(system.space.xN, …)` rather than inventing a value.
- **Radius by size.** Map `border-radius` to `system.shape.*` by px. Pill/round shapes (large radius or `9999px`) -> `system.shape.round`.
- **Don't over-map.** Leave `0`, `1px` hairline borders, `100%`, `auto`, transforms, and animation timings alone unless they clearly correspond to a token (e.g. a `1px` divider color still gets a color token).
- **Brand vs system.** Use `brand.*` only when the value is explicitly a tenant/brand accent the user wants themeable; default to `system.*` (which already resolves through brand for primary).

### Color cheat sheet (most common raw values)

| Raw value | Role in CSS | Map to (JS path) | cssVar output |
|---|---|---|---|
| `#0875e1`, Workday "Blueberry 400" | button/surface fill | `system.color.bg.primary.default` | `var(--cnvs-sys-color-bg-primary-default)` |
| `#0875e1` | link/icon/accent text | `system.color.fg.primary.default` | `var(--cnvs-sys-color-fg-primary-default)` |
| `#0875e1` | focus ring / primary border | `system.color.border.primary.default` | `var(--cnvs-sys-color-border-primary-default)` |
| `#fff`, `#ffffff`, `white` | page/surface background | `system.color.bg.default` | `var(--cnvs-sys-color-bg-default)` |
| `#fff` | text on a dark/primary surface | `system.color.fg.inverse` | `var(--cnvs-sys-color-fg-inverse)` |
| near-black body text (`#1f262e`, `#333`) | primary text | `system.color.fg.default` | `var(--cnvs-sys-color-fg-default)` |
| heading text (darker) | strong/stronger text | `system.color.fg.strong` / `.stronger` | `var(--cnvs-sys-color-fg-strong)` |
| muted/secondary/placeholder gray | secondary text | `system.color.fg.muted.default` | `var(--cnvs-sys-color-fg-muted-default)` |
| disabled gray text | disabled | `system.color.fg.disabled` | `var(--cnvs-sys-color-fg-disabled)` |
| subtle panel / app canvas gray | alt background | `system.color.bg.alt.default` / `.softer` | `var(--cnvs-sys-color-bg-alt-default)` |
| hairline divider gray | divider | `system.color.border.divider` | `var(--cnvs-sys-color-border-divider)` |
| input outline gray | input border | `system.color.border.input.default` | `var(--cnvs-sys-color-border-input-default)` |
| green success (`#12a67c`-ish) | positive | `system.color.fg.positive.default` / `bg.positive.default` | `var(--cnvs-sys-color-fg-positive-default)` |
| red error (`#de2e21`-ish) | critical | `system.color.fg.critical.default` / `border.critical.default` | `var(--cnvs-sys-color-fg-critical-default)` |
| amber/yellow warning (`#ffc629`-ish) | caution | `system.color.fg.caution.default` / `bg.caution.default` | `var(--cnvs-sys-color-bg-caution-default)` |

> The legacy named hex (`#0875e1` = `base.blueberry400`) is still valid base; prefer the semantic `system.*` mapping above for new work. Use `system.color.static.*` only for charts/illustrations that must never theme-shift.

### Spacing cheat sheet (snap to nearest)

| px | rem | Token | cssVar |
|---|---|---|---|
| 0 | 0 | `system.space.zero` | `var(--cnvs-sys-space-zero)` |
| 2 | 0.125 | `system.space.half` | `var(--cnvs-sys-space-half)` |
| 4 | 0.25 | `system.space.x1` | `var(--cnvs-sys-space-x1)` |
| 8 | 0.5 | `system.space.x2` | `var(--cnvs-sys-space-x2)` |
| 12 | 0.75 | `system.space.x3` | `var(--cnvs-sys-space-x3)` |
| **16** | **1** | **`system.space.x4`** | `var(--cnvs-sys-space-x4)` |
| 20 | 1.25 | `system.space.x5` | `var(--cnvs-sys-space-x5)` |
| 24 | 1.5 | `system.space.x6` | `var(--cnvs-sys-space-x6)` |
| 32 | 2 | `system.space.x8` | `var(--cnvs-sys-space-x8)` |
| 40 | 2.5 | `system.space.x10` | `var(--cnvs-sys-space-x10)` |
| 56 | 3.5 | `system.space.x14` | `var(--cnvs-sys-space-x14)` |
| 64 | 4 | `system.space.x16` | `var(--cnvs-sys-space-x16)` |
| 80 | 5 | `system.space.x20` | `var(--cnvs-sys-space-x20)` |

> The scale is discrete: `x1,x2,x3,x4,x5,x6,x8,x10,x14,x16,x20` (+ `half`, `zero`). There is no `x7/x9/x11`. A value like `18px` snaps to `x4` (16px) and is flagged medium-confidence; `28px` -> `x6` (24px) or `x8` (32px) — pick by context. For exact in-between, use `calc.add(system.space.x4, system.space.half)` etc.

### Radius cheat sheet

| px | Token | cssVar | Typical use |
|---|---|---|---|
| 0 | `system.shape.none` | `var(--cnvs-sys-shape-none)` | square |
| 2 | `system.shape.half` | `var(--cnvs-sys-shape-half)` | subtle |
| 4 | `system.shape.x1` | `var(--cnvs-sys-shape-x1)` | inputs, small chips |
| 6 | `system.shape.x1Half` | `var(--cnvs-sys-shape-x1-half)` | — |
| **8** | **`system.shape.x2`** | `var(--cnvs-sys-shape-x2)` | **cards, containers (the Canvas "l" radius)** |
| 16 | `system.shape.x4` | `var(--cnvs-sys-shape-x4)` | large surfaces |
| 24 | `system.shape.x6` | `var(--cnvs-sys-shape-x6)` | — |
| pill / `9999px` / circle | `system.shape.round` | `var(--cnvs-sys-shape-round)` | buttons (pills), avatars |

> Canvas buttons are fully-rounded pills — a button's `border-radius` maps to `system.shape.round`, not `shape.x2`.

## Output example

Before:
```tsx
const card = { background: '#ffffff', padding: '16px', borderRadius: '8px', color: '#1f262e', border: '1px solid #dfe2e6' };
```
After:
```tsx
import {cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const card = {
  background: cssVar(system.color.bg.default),        // #ffffff
  padding: cssVar(system.space.x4),                   // 16px
  borderRadius: cssVar(system.shape.x2),              // 8px
  color: cssVar(system.color.fg.default),             // #1f262e
  border: `1px solid ${cssVar(system.color.border.divider)}`, // #dfe2e6
};
```

## No clean match

If a value has no defensible token (e.g. an off-brand `#7b2ff7` purple, an arbitrary `13px`), DO NOT force it. Report it in the table as `no clean match — review` with the two nearest candidates, and suggest the nearest in-system alternative. Off-brand colors that should simply be replaced (not tokenized as-is) are an audit finding — point the user to `/canvasmith:audit`.

## DO / DON'T

- DO map by semantic role (read the CSS property), not by raw hex distance.
- DO emit `cssVar(system.…)` in JS and `var(--cnvs-sys-…)` in CSS; add the imports if missing.
- DO snap spacing/radius to the nearest scale step and flag confidence.
- DON'T invent token paths — every token you emit must exist in `../canvas-ui/reference/tokens.md`.
- DON'T mix the deprecated `@workday/canvas-kit-react/tokens` JS objects (`colors`, `space`, `borderRadius`) — those are deprecated; emit `@workday/canvas-tokens-web` `system.*` only.
- DON'T change component imports or markup — that's `/canvasmith:convert`. DON'T merely list problems — that's `/canvasmith:audit`.
