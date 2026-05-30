# Canvas Design Tokens — builder reference

Workday Canvas design tokens for `@workday/canvas-tokens-web@4.3.0`. These are the **real**
CSS-variable values that make a UI look Workday-native. Use **system** tokens for new work; reach
for base/brand only when a system token does not exist.

> **Two token systems coexist — do not mix them up.**
> - **USE THIS:** `@workday/canvas-tokens-web` (v4.3.0). CSS-variable based, three layers
>   **base → brand → system**. The JS objects (`base`, `brand`, `system`) resolve to CSS-variable
>   *name strings* (e.g. `'--cnvs-sys-color-bg-primary-default'`), which you wrap in `var()` (via `cssVar()`).
> - **DO NOT use:** `@workday/canvas-kit-react/tokens` (the old `colors`, `space`, `borderRadius`,
>   `depth`, `type` JS objects). Every export is `@deprecated` in v15 and slated for removal.

---

## How to consume

### Step 1 — the FOUR CSS imports (inject the `--cnvs-*` variables once, at app root)

```ts
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';
```

These define the `--cnvs-*` custom properties on `:root`. **Without them, every JS token string
resolves to an undefined CSS variable** and the UI renders unstyled. Import all four; component-level
tokens live in the 4th file.

### Step 2 — import the JS token objects (they are CSS-var NAME strings, not values)

```ts
import {base, brand, system} from '@workday/canvas-tokens-web';
// system.color.bg.primary.default === '--cnvs-sys-color-bg-primary-default'
// base.blueberry400               === '--cnvs-base-palette-blueberry-400'
```

### Step 3 — wrap in `var()` via `cssVar()` (from `@workday/canvas-kit-styling`)

`cssVar(name, fallback?)` returns `var(name)` (or `var(name, fallback)`; if `fallback` itself starts
with `--`, it is wrapped too).

```ts
import {createStyles, cssVar, px2rem, calc} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const card = createStyles({
  backgroundColor: cssVar(system.color.bg.default),          // var(--cnvs-sys-color-bg-default)
  color:           cssVar(system.color.fg.default),
  padding:         cssVar(system.space.x4),                  // 16px
  borderRadius:    cssVar(system.shape.x2),                  // 8px
  boxShadow:       cssVar(system.depth[1]),
  ...system.type.body.small,                                 // spread a named type style object
});
```

Plain CSS (no JS) works the same way — reference the variable directly:

```css
.card {
  background-color: var(--cnvs-sys-color-bg-default);
  box-shadow: var(--cnvs-sys-depth-1);
  border-radius: var(--cnvs-sys-shape-x2);
}
```

> Canvas components accept a **`cs` prop** for overrides; pass token strings directly:
> `<PrimaryButton cs={{marginTop: system.space.x4}}>Save</PrimaryButton>`.

### Naming prefixes (v4.3.0)

| Layer | CSS prefix | JS object |
|---|---|---|
| base | `--cnvs-base-palette-*`, `--cnvs-base-*` | `base.*` |
| brand | `--cnvs-brand-*` | `brand.*` |
| system | `--cnvs-sys-*` | `system.*` |
| component | `--cnvs-comp-*` | `component.*` |

> Base **color** prefix is `--cnvs-base-palette-*` (NOT `--cnvs-base-color-*`).

---

## Color

The base layer ships **two palettes** at once: a classic named-fruit palette with literal hex, and a
newer **perceptual OKLCH** palette keyed by semantic hue (`blue`, `green`, `amber`, `red`, `slate`,
`neutral`, …). **In v4.3.0 the SYSTEM layer references the OKLCH palette** — e.g.
`system.color.bg.primary.default` → `blue-600` (OKLCH), *not* `blueberry-600`. **Prefer system tokens
for new work.** Use the named-fruit hex only for direct base use or back-compat.

### System semantic color (USE THESE)

CSS pattern `--cnvs-sys-color-<group>-<...>`; JS `system.color.<group>.<...>`.

**Foreground — `system.color.fg.*`** (text/icon-on-surface)

| JS path | CSS var | → base |
|---|---|---|
| `system.color.fg.default` | `--cnvs-sys-color-fg-default` | `neutral-a800` (default body text) |
| `system.color.fg.strong` | `--cnvs-sys-color-fg-strong` | `neutral-a900` |
| `system.color.fg.stronger` | `--cnvs-sys-color-fg-stronger` | `neutral-a950` (headings) |
| `system.color.fg.inverse` | `--cnvs-sys-color-fg-inverse` | `neutral-0` (text on dark/primary) |
| `system.color.fg.disabled` | `--cnvs-sys-color-fg-disabled` | `slate-a400` |
| `system.color.fg.muted.default` | `--cnvs-sys-color-fg-muted-default` | `slate-a600` (secondary text) |
| `system.color.fg.primary.default` | `--cnvs-sys-color-fg-primary-default` | `blue-600` (link/brand text) |
| `system.color.fg.positive.default` | `--cnvs-sys-color-fg-positive-default` | `green-600` |
| `system.color.fg.caution.default` | `--cnvs-sys-color-fg-caution-default` | `amber-900` |
| `system.color.fg.critical.default` | `--cnvs-sys-color-fg-critical-default` | `red-600` |

**Background — `system.color.bg.*`**

| JS path | CSS var | → base |
|---|---|---|
| `system.color.bg.default` | `--cnvs-sys-color-bg-default` | `neutral-0` (white page/surface) |
| `system.color.bg.alt.soft` | `--cnvs-sys-color-bg-alt-soft` | `slate-50` (subtle zebra/panel) |
| `system.color.bg.alt.default` | `--cnvs-sys-color-bg-alt-default` | `slate-50` |
| `system.color.bg.alt.strong` | `--cnvs-sys-color-bg-alt-strong` | `slate-200` |
| `system.color.bg.primary.default` | `--cnvs-sys-color-bg-primary-default` | **`blue-600`** (primary button fill) |
| `system.color.bg.primary.strong` | `--cnvs-sys-color-bg-primary-strong` | `blue-700` (hover) |
| `system.color.bg.positive.default` | `--cnvs-sys-color-bg-positive-default` | `green-600` |
| `system.color.bg.caution.default` | `--cnvs-sys-color-bg-caution-default` | `amber-400` |
| `system.color.bg.critical.default` | `--cnvs-sys-color-bg-critical-default` | `red-600` (delete button fill) |
| `system.color.bg.contrast.default` | `--cnvs-sys-color-bg-contrast-default` | `neutral-900` |
| `system.color.bg.overlay` | `--cnvs-sys-color-bg-overlay` | black @ opacity 0.4 (modal dimmer) |

> In tokens-web 4.3.0, `system.color.bg.primary.default` maps to the **OKLCH blue (`blue-600`)**, not
> the legacy Blueberry hex. Use the system token for the "Workday blue" primary action — never a raw hex.

**Border — `system.color.border.*`**

| JS path | CSS var | → base |
|---|---|---|
| `system.color.border.container` | `--cnvs-sys-color-border-container` | `slate-300` (card/box outline) |
| `system.color.border.divider` | `--cnvs-sys-color-border-divider` | `slate-200` (hairline rule) |
| `system.color.border.input.default` | `--cnvs-sys-color-border-input-default` | `slate-a500` (field outline) |
| `system.color.border.input.strong` | `--cnvs-sys-color-border-input-strong` | `slate-700` |
| `system.color.border.primary.default` | `--cnvs-sys-color-border-primary-default` | `blue-500` |
| `system.color.border.critical.default` | `--cnvs-sys-color-border-critical-default` | `red-500` |

**Icon — `system.color.icon.*`** (for `SystemIcon` color)

| JS path | CSS var | → base |
|---|---|---|
| `system.color.icon.default` | `--cnvs-sys-color-icon-default` | `neutral-800` |
| `system.color.icon.soft` | `--cnvs-sys-color-icon-soft` | `slate-600` |
| `system.color.icon.strong` | `--cnvs-sys-color-icon-strong` | `neutral-900` |
| `system.color.icon.inverse` | `--cnvs-sys-color-icon-inverse` | `neutral-0` |
| `system.color.icon.disabled` | `--cnvs-sys-color-icon-disabled` | `slate-400` |
| `system.color.icon.primary.default` | `--cnvs-sys-color-icon-primary-default` | `blue-600` |
| `system.color.icon.positive.default` | `--cnvs-sys-color-icon-positive-default` | `green-600` |
| `system.color.icon.caution.default` | `--cnvs-sys-color-icon-caution-default` | `amber-900` |
| `system.color.icon.critical.default` | `--cnvs-sys-color-icon-critical-default` | `red-600` |

> **Static** colors (`system.color.static.*`, families `white/black/gray/blue/green/red/amber/orange/gold`)
> never theme-shift — use them only for charts/illustrations, not UI chrome.

### Brand layer (tenant-themeable)

CSS `--cnvs-brand-<category>-<variant>`; JS `brand.<category>.<variant>`. Categories:
`primary` (== action), `success`, `alert`, `error`, `neutral`, plus `common`/`gradient`. Variants:
`base, dark, darkest, light, lighter, lightest, accent`.

| Brand token | JS path | Resolves to |
|---|---|---|
| `--cnvs-brand-primary-base` | `brand.primary.base` (a.k.a. `brand.action.base`) | `blue-600` (brand action fill) |
| `--cnvs-brand-primary-dark` | `brand.primary.dark` | `blue-700` |
| `--cnvs-brand-primary-accent` | `brand.primary.accent` (a.k.a. `brand.action.accent`) | `neutral-0` (text/icon ON the action color) |
| `--cnvs-brand-primary-lightest` | `brand.primary.lightest` (a.k.a. `brand.action.lightest`) | `blue-25` |

```ts
// background + readable foreground from one family:
backgroundColor: cssVar(brand.primary.base),
color:           cssVar(brand.primary.accent),
```

### Base palette — classic named hues (literal hex)

CSS `--cnvs-base-palette-<hue>-<stop>`; JS `base.<hueCamel><stop>` (e.g. `base.blueberry400`). Stops
run **100 (lightest) → 600 (darkest)**. Verbatim hex from the v4.3.0 base `_variables.css`:

| Hue | 100 | 200 | 300 | 400 | 500 | 600 |
|---|---|---|---|---|---|---|
| `blueberry` | `#D7EAFC` | `#A6D2FF` | `#40A0FF` | **`#0875E1`** | `#005cb9` | `#004387` |
| `green-apple` | `#ebfff0` | `#acf5be` | `#5fe380` | `#43c463` | `#319c4c` | `#217a37` |
| `sour-lemon` | `#fff9e6` | `#ffecab` | `#ffda61` | `#ffc629` | `#ebb400` | `#bd9100` |
| `cinnamon` | `#ffefee` | `#FCC9C5` | `#ff867d` | `#ff5347` | `#de2e21` | `#a31b12` |
| `licorice` | `#A1AAB3` | `#7b858f` | `#5E6A75` | `#4a5561` | `#333d47` | `#1f262e` |
| `soap` | `#f6f7f8` | `#F0F1F2` | `#e8ebed` | `#DFE2E6` | `#ced3d9` | `#B9C0C7` |
| `french-vanilla` | `#ffffff` | `#ebebeb` | `#d4d4d4` | `#bdbdbd` | `#a6a6a6` | `#8f8f8f` |
| `black-pepper` | `#787878` | `#616161` | `#494949` | `#333333` | `#1e1e1e` | `#000000` |

**Canonical "Workday Blueberry 400" primary blue = `#0875E1`** (`--cnvs-base-palette-blueberry-400` /
`base.blueberry400`). For *new* primary-action UI, prefer the system token
`system.color.bg.primary.default` (→ OKLCH `blue-600`) rather than this legacy hex.

---

## Type

CSS `--cnvs-sys-*`; JS `system.*`. Font families and weights:

- `system.fontFamily.default` → `--cnvs-sys-font-family-default` = **`"Roboto"`**
- `system.fontFamily.mono` → `--cnvs-sys-font-family-mono` = **`"Roboto Mono"`**
- `system.fontFamily.global` → `--cnvs-sys-font-family-global` = `"Noto Sans"`
- `system.fontWeight.{light=300, normal=400, medium=500, bold=700}`

**Named type styles** — `system.type.<level>.<size>` returns a **style object** (fontFamily,
fontWeight, fontSize, lineHeight, letterSpacing). Spread it into your styles. Levels: `title, heading,
body, subtext`; sizes: `large, medium, small`. (rem→px at 16px root.)

| `system.type` path | font-size (rem / px) | line-height (rem / px) | weight |
|---|---|---|---|
| `title.large` | 3.5rem / 56px | 4rem / 64px | 700 |
| `title.medium` | 3rem / 48px | 3.5rem / 56px | 700 |
| `title.small` | 2.5rem / 40px | 3rem / 48px | 700 |
| `heading.large` | 2rem / 32px | 2.5rem / 40px | 700 |
| `heading.medium` | 1.75rem / 28px | 2.25rem / 36px | 700 |
| `heading.small` | 1.5rem / 24px | 2rem / 32px | 700 |
| `body.large` | 1.25rem / 20px | 1.75rem / 28px | 400 |
| `body.medium` | 1.125rem / 18px | 1.75rem / 28px | 400 |
| `body.small` | 1rem / 16px | 1.5rem / 24px | 400 |
| `subtext.large` | 0.875rem / 14px | 1.25rem / 20px | 400 |
| `subtext.medium` | 0.75rem / 12px | 1rem / 16px | 400 |
| `subtext.small` | 0.625rem / 10px | 1rem / 16px | 400 |

```ts
const heading = createStyles({...system.type.heading.medium, color: cssVar(system.color.fg.stronger)});
```

Ready-made CSS utility classes also ship: `.cnvs-sys-type-heading-large`, `.cnvs-sys-type-body-small`, etc.

---

## Space

Base unit = **`--cnvs-base-unit` = 0.25rem (4px)**; system space multiplies it. CSS
`--cnvs-sys-space-<key>`; JS `system.space.<key>`. (rem→px at 16px root.)

| JS path | CSS var | rem | px |
|---|---|---|---|
| `system.space.zero` | `--cnvs-sys-space-zero` | 0 | 0 |
| `system.space.half` | `--cnvs-sys-space-half` | 0.125rem | 2px |
| `system.space.x1` | `--cnvs-sys-space-x1` | 0.25rem | 4px |
| `system.space.x2` | `--cnvs-sys-space-x2` | 0.5rem | 8px |
| `system.space.x3` | `--cnvs-sys-space-x3` | 0.75rem | 12px |
| `system.space.x4` | `--cnvs-sys-space-x4` | **1rem** | **16px** |
| `system.space.x5` | `--cnvs-sys-space-x5` | 1.25rem | 20px |
| `system.space.x6` | `--cnvs-sys-space-x6` | 1.5rem | 24px |
| `system.space.x8` | `--cnvs-sys-space-x8` | 2rem | 32px |
| `system.space.x10` | `--cnvs-sys-space-x10` | 2.5rem | 40px |
| `system.space.x14` | `--cnvs-sys-space-x14` | 3.5rem | 56px |
| `system.space.x16` | `--cnvs-sys-space-x16` | 4rem | 64px |
| `system.space.x20` | `--cnvs-sys-space-x20` | 5rem | 80px |

> **The scale is discrete — there is NO `x7`, `x9`, `x11`, `x12`, etc.** v4.3.0 ships exactly
> `zero, half, x1, x2, x3, x4, x5, x6, x8, x10, x14, x16, x20`. For an in-between value, compose with
> `calc` — never hardcode a px:
> ```ts
> import {calc} from '@workday/canvas-kit-styling';
> paddingInline: calc.add(system.space.x6, system.space.x1),   // 24 + 4 = 28px
> marginTop:     calc.negate(system.space.x4),                 // -16px
> ```

---

## Shape / radius

CSS `--cnvs-sys-shape-<key>`; JS `system.shape.<key>`. (rem→px at 16px root.)

| JS path | CSS var | rem / px |
|---|---|---|
| `system.shape.none` / `.zero` | `--cnvs-sys-shape-none` | 0 |
| `system.shape.half` | `--cnvs-sys-shape-half` | 0.125rem / 2px |
| `system.shape.x1` | `--cnvs-sys-shape-x1` | 0.25rem / 4px |
| `system.shape.x1Half` | `--cnvs-sys-shape-x1-half` | 0.375rem / 6px |
| `system.shape.x2` | `--cnvs-sys-shape-x2` | 0.5rem / 8px |
| `system.shape.x4` | `--cnvs-sys-shape-x4` | 1rem / 16px |
| `system.shape.x6` | `--cnvs-sys-shape-x6` | 1.5rem / 24px |
| `system.shape.round` | `--cnvs-sys-shape-round` | pill / circle (62.5rem) |

Typical mapping: inputs & buttons use `system.shape.x1` (4px); cards use `system.shape.x2` (8px);
pills/avatars use `system.shape.round`.

---

## Depth (elevation)

CSS `--cnvs-sys-depth-<1..6>`; JS `system.depth[1..6]` (two-layer slate-tinted shadows). There is **no
`depth.none`** — to remove a shadow set `boxShadow: 'none'`.

| JS path | Use for |
|---|---|
| `system.depth[1]` | Cards |
| `system.depth[2]` | Top/bottom navigation |
| `system.depth[3]` | FABs, menus, side panels (alternate) |
| `system.depth[4]` | Raised elements |
| `system.depth[5]` | Popups, toasts, dialogs |
| `system.depth[6]` | Modals / overlay behavior |

```ts
boxShadow: cssVar(system.depth[1]),
```

---

## Opacity

CSS `--cnvs-sys-opacity-<key>`; JS `system.opacity.<key>`.

| JS path | Value |
|---|---|
| `system.opacity.full` | 1 |
| `system.opacity.zero` | 0 |
| `system.opacity.disabled` | 0.4 |
| `system.opacity.overlay` | 0.64 |
| `system.opacity.contrast` | 0.84 |

---

## Breakpoints

CSS `--cnvs-sys-breakpoints-<key>`; JS `system.breakpoints.<key>`.

| JS path | Width |
|---|---|
| `system.breakpoints.zero` | 0 |
| `system.breakpoints.s` (`sm`) | 320px |
| `system.breakpoints.m` (`md`) | 768px |
| `system.breakpoints.l` (`lg`) | 1024px |
| `system.breakpoints.xl` | 1440px |

---

## Nearest-token cheat sheet

When you find a **raw value** in AI-generated UI, replace it with the Canvas token below. Never leave
a raw hex/px in styling.

| Raw value | → Canvas token | Notes |
|---|---|---|
| `#3b82f6`, `#2563eb`, "tailwind blue", any generic primary blue | `system.color.bg.primary.default` | Workday blue primary fill (→ OKLCH `blue-600`) |
| `#0875E1` (Blueberry 400) | `system.color.bg.primary.default` (new) or `base.blueberry400` (legacy hex) | Prefer the system token for new UI |
| `#ffffff` page/card background | `system.color.bg.default` | |
| `#f9fafb` / `#f3f4f6` subtle panel | `system.color.bg.alt.soft` | |
| `#111827` / near-black heading text | `system.color.fg.stronger` | body text → `system.color.fg.default` |
| `#6b7280` muted/secondary text | `system.color.fg.muted.default` | |
| `#e5e7eb` / `#d1d5db` divider/border | `system.color.border.divider` / `.container` | |
| `#16a34a` / generic success green | `system.color.bg.positive.default` | text → `system.color.fg.positive.default` |
| `#dc2626` / `#ef4444` generic danger red | `system.color.bg.critical.default` | text → `system.color.fg.critical.default` |
| `#f59e0b` / `#facc15` generic warning yellow | `system.color.bg.caution.default` | text → `system.color.fg.caution.default` |
| `4px` spacing/gap | `system.space.x1` | |
| `8px` | `system.space.x2` | |
| `12px` | `system.space.x3` | |
| `16px` | `system.space.x4` | most common gutter |
| `20px` | `system.space.x5` | |
| `24px` | `system.space.x6` | |
| `32px` | `system.space.x8` | |
| `40px` | `system.space.x10` | |
| `28px` (no exact token) | `calc.add(system.space.x6, system.space.x1)` | 24 + 4 |
| `4px` radius | `system.shape.x1` | inputs/buttons |
| `8px` radius | `system.shape.x2` | cards |
| `16px` radius | `system.shape.x4` | |
| `9999px` / fully-rounded radius | `system.shape.round` | pills, avatars |
| `font-size: 16px; line-height: 24px` | `...system.type.body.small` | default body |
| `font-size: 24px; bold` heading | `...system.type.heading.small` | |
| `font-family: Inter / system-ui / sans-serif` | `system.fontFamily.default` | Roboto |
| `font-family: monospace` (code) | `system.fontFamily.mono` | Roboto Mono |
| `box-shadow: 0 1px 3px rgba(0,0,0,.1)` (card) | `system.depth[1]` | |
| `box-shadow` on a modal/dialog | `system.depth[5]` / `[6]` | |
| `opacity: 0.5` on disabled | `system.opacity.disabled` (0.4) | |
