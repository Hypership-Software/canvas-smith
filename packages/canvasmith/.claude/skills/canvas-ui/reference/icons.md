# Canvas Icons — builder reference

How to render icons the Workday-native way, using **`@workday/canvas-system-icons-web@4.0.4`** and the
`SystemIcon` component from `@workday/canvas-kit-react/icon`.

> ## THE HARD RULE
> **NEVER use an emoji, a Unicode glyph, an inline `<svg>`, a font-icon (Font Awesome, Material
> Icons), or a random downloaded SVG.** Every icon in Workday-native UI is a real Canvas **system
> icon** rendered through `SystemIcon`. If the AI-generated source has `🔍`, `✓`, `<svg>…</svg>`, or
> `<i className="fa-...">`, replace it with the matching Canvas system icon.

---

## Import & render

Icons are imported as named exports from `@workday/canvas-system-icons-web` and passed to the `icon`
prop. The export naming convention is **`<name>Icon`** in camelCase
(e.g. `plusIcon`, `searchIcon`, `checkIcon`, `trashIcon`, `xIcon`).

```tsx
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {activityStreamIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';

<SystemIcon icon={activityStreamIcon} size="md" color={system.color.icon.default} />
```

`SystemIcon` renders a `<span>` wrapping a multi-layer SVG (`.wd-icon-fill`, `.wd-icon-accent`,
`.wd-icon-background`). It is `createComponent('span')`, forwards `ref`, and accepts `as` and `cs`.

### Buttons take an `icon` prop — don't nest a `SystemIcon`

Canvas buttons accept the **icon object directly** (not a `<SystemIcon>` element):

```tsx
import {PrimaryButton, TertiaryButton} from '@workday/canvas-kit-react/button';
import {plusIcon} from '@workday/canvas-system-icons-web';

<PrimaryButton icon={plusIcon} iconPosition="start">Add</PrimaryButton>
<TertiaryButton icon={plusIcon} aria-label="Add" />   {/* icon-only → REQUIRES aria-label */}
```

Use a standalone `<SystemIcon>` only for decorative/standalone glyphs (in a list row, status line,
empty state, etc.). Components such as `Toast.Icon` and `StatusIndicator.Icon` also take the icon via
their own `icon` prop.

---

## Size

`SystemIcon`'s `size` prop accepts a named variant, a number (px), or a string. **Default is 24px.**

| `size` | px / rem |
|---|---|
| `"xxs"` | 14px / 0.875rem |
| `"xs"` | 16px / 1rem |
| `"sm"` | 18px / 1.125rem |
| `"md"` | 20px / 1.25rem |
| `"lg"` | 24px / 1.5rem (default) |
| `"xl"` | 32px / 2rem |
| number / string | exact, e.g. `size={20}` or `size="1.25rem"` |

```tsx
<SystemIcon icon={searchIcon} size="sm" />
<SystemIcon icon={searchIcon} size={20} />
```

---

## Color — set it via the `systemIconStencil` vars

The icon's color is driven by three stencil variables (`color`, `accentColor`, `backgroundColor`),
exposed through props on `SystemIcon`. **`color` sets both the fill and the accent layer** — it is the
only one you usually need. Always pass a **Canvas token** (a `--cnvs-*` var string), never a raw hex.

| Prop | Stencil var | Sets SVG layer |
|---|---|---|
| `color` | `systemIconStencil.vars.color` | `.wd-icon-fill` **and** `.wd-icon-accent` |
| `accent` | `systemIconStencil.vars.accentColor` | `.wd-icon-accent` only (overrides `color` for that layer) |
| `background` | `systemIconStencil.vars.backgroundColor` | `.wd-icon-background` (default `transparent`) |

```tsx
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {checkIcon, exclamationCircleIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';

// Default UI icon color:
<SystemIcon icon={uploadCloudIcon} color={system.color.icon.default} />   // → neutral-800
// Semantic colors:
<SystemIcon icon={checkIcon}            color={system.color.icon.positive.default} />  // green
<SystemIcon icon={exclamationCircleIcon} color={system.color.icon.critical.default} /> // red
// On a dark/primary surface:
<SystemIcon icon={searchIcon} color={system.color.icon.inverse} />        // white
```

Use the `system.color.icon.*` family for icon color: `default`, `soft`, `strong`, `inverse`,
`disabled`, `primary.default`, `positive.default`, `caution.default`, `critical.default`. (See
`reference/tokens.md`.)

You can also style via the stencil in your own component:

```tsx
import {createStencil} from '@workday/canvas-kit-styling';
import {systemIconStencil} from '@workday/canvas-kit-react/icon';
import {system} from '@workday/canvas-tokens-web';

const rowStencil = createStencil({
  base: {
    // set the icon var for any SystemIcon rendered inside:
    [systemIconStencil.vars.color]: system.color.icon.soft,
  },
});
```

---

## AccentIcon (decorative, larger) — preview / deprecated note

`AccentIcon` renders the larger two-tone decorative accent icons from
**`@workday/canvas-accent-icons-web`** (different package from system icons). It is exported from
`@workday/canvas-kit-react/icon`.

> **`AccentIcon` is `@deprecated` in v15** (Canvas Kit v15.0.0). Prefer `SystemIcon` for UI. Use
> `AccentIcon` only when a design explicitly calls for a large illustrative accent glyph.

```tsx
import {AccentIcon} from '@workday/canvas-kit-react/icon';
import {shieldIcon} from '@workday/canvas-accent-icons-web';
import {system} from '@workday/canvas-tokens-web';

<AccentIcon icon={shieldIcon} color={system.color.bg.primary.strong} size={56} />
```

Props: `icon` (required, a `CanvasAccentIcon`), `color?` (fill; default
`system.color.bg.primary.strong`), `transparent?` (drop the background fill), `size?` (px, default 56).

Related icon components in `@workday/canvas-kit-react/icon`: `AppletIcon` (applet icons from
`@workday/canvas-applet-icons-web`), `Graphic` (full illustrations from `@workday/canvas-graphics-web`,
takes `src`), `SystemIconCircle`, `ExpressiveIcon`, and the low-level `Svg`.

---

## How to discover the right icon name

System icons follow the predictable **`<conceptName>Icon`** camelCase export pattern. To find one:

1. **Browse the official catalog:** <https://workday.github.io/canvas-system-icons/> — search by
   keyword, then read off the exact import name shown for the icon.
2. **Grep your installed package** for a concept:
   ```bash
   # list every export matching a keyword (e.g. "arrow"):
   grep -oE "[a-zA-Z0-9]+Icon" node_modules/@workday/canvas-system-icons-web/dist/es6/index.js | sort -u | grep -i arrow
   ```
3. **In your editor**, type `import {  } from '@workday/canvas-system-icons-web'` and trigger
   autocomplete — every icon is a named export.

### Common, verified icon names

`plusIcon`, `xIcon`, `checkIcon`, `searchIcon`, `trashIcon`, `editIcon`, `uploadCloudIcon`,
`activityStreamIcon`, `relatedActionsIcon` (the "⋮" overflow menu), `chevronDownIcon`,
`chevronRightIcon`, `exclamationCircleIcon`, `exclamationTriangleIcon`, `infoIcon`, `gearIcon`,
`filterIcon`, `tableIcon`, `gridIcon`.

> If you cannot find an exact match, pick the **closest documented Canvas system icon** — do **not**
> fall back to an emoji or a custom SVG. That is the one rule that never bends.
