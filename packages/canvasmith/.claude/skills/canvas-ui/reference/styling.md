# Canvas Kit Styling Engine Reference

> The styling layer for `@workday/canvas-kit-styling@15.0.6`. Everything here is copy-pasteable
> and version-pinned. Import the token CSS files once (see `setup.md`) or token vars resolve to
> nothing.

## Mental model (read this first)

Canvas Styling is **NOT plain `@emotion/react`**. It uses `@emotion/css` with its own custom Emotion
instance/cache, and **injects styles at module-import (JS evaluation) time, not at render time**.
Two consequences drive every rule below:

- It replaces Emotion's runtime JS merging with **build-friendly CSS-specificity merging**. Instead of
  one merged class you get **multiple class names layered by CSS specificity** (all at `0-1-0`), where
  **"last defined wins."** R3: _"Order of declaration therefore matters."_
- Because styles inject at import time, you **define styles at MODULE SCOPE, never inside render**.
  R3 (CreateStyles.mdx 46–64): calling `createStyles` inside render _"injects a new sheet every render —
  performance bug."_

Two entry points:

- **`createStyles`** — static object styles -> returns ONE class-name string. Use for simple/override styles.
- **`createStencil`** — the reusable component styling system (`vars`, `base`, `modifiers`, `parts`,
  `compound`, `extends`). Returns a function `-> {className, style?}`.

Both apply to Canvas components via the **`cs` prop**, or to raw elements via **`handleCsProp`** /
**`mergeStyles`**.

---

## The rules that matter

1. **Define styles at MODULE SCOPE.** Never call `createStyles`/`createStencil` inside a render function.
2. **`base` / a modifier value must be a FUNCTION when it references `vars` or `parts`** — their real names
   are runtime-generated (`'--headerColor-<hash>'`, `'[data-part="..."]'`), so you must receive them as
   arguments. Use the object form only when you reference neither.
3. **Merge order is by CSS specificity:** `base` -> `modifiers` (in declaration order) -> `compound`
   (in declaration order). All classes are `0-1-0`, so **last-defined wins** for the same property.
4. **Element `style` beats any class** (highest specificity). That is why passing a stencil `vars` value
   produces a `style: {'--x': value}` that overrides `base`.
5. **Use a fallback when reading an uninitialized var** (`cssVar(x, fallback)`); an uninitialized CSS var
   falls back to `initial` otherwise.
6. **Use tokens for every value** — wrap math in `calc.*`, sizes in `px2rem`, interactive colors in
   `colorSpace.*`.

---

## `createStyles`

Signature (cs.ts 760–762): `createStyles(...args: ({name,styles} | StyleProps | string)[]) => string`.
Accepts style objects, class-name strings, or pre-serialized styles; returns a **single class name**.

```tsx
import {createStyles} from '@workday/canvas-kit-styling';
import {system, base} from '@workday/canvas-tokens-web';

// GOOD: module scope (outside render)
const uppercaseTextStyles = createStyles({
  textTransform: 'uppercase',
  margin: system.gap.md, // auto-wrapped -> var(--cnvs-sys-gap-md)
  color: base.red600,    // auto-wrapped -> var(--cnvs-base-red-600)
});

// usage:  <Text cs={uppercaseTextStyles}>...</Text>   or   <div className={uppercaseTextStyles} />
```

- `createStyles` **auto-wraps token values in `var(...)`** (CreateStyles.mdx 34–40).
- Pseudo-selectors and child selectors are allowed (anything `@emotion/css` allows).
- Emitted HTML is `<div class="css-m39zwu"></div>`; the CSS uses the `--cnvs-...` vars.

---

## `createStencil`

Signature (cs.ts 1323): `createStencil(config, id?) => Stencil`. Config keys:
`{vars, base, modifiers, defaultModifiers, compound, parts, extends}`. Calling the returned stencil
yields `{className: string, style?: Record<string, string>}` (cs.ts 1227–1230).

### Full canonical example (vars + parts + base-as-function + modifier)

Verbatim from `modules/styling/stories/mdx/examples/CreateStencil.tsx`:

```tsx
import {createStencil} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const themedCardStencil = createStencil({
  vars: {
    // Create CSS variables for the color of the header
    headerColor: '', // '' = uninitialized (cascades; no cascade barrier)
  },
  parts: {
    // Style a sub-element that may not be exposed through the API
    header: 'themed-card-header',
    body: 'themed-card-body',
  },
  // base AS A FUNCTION because it references vars/parts (their real names are runtime-generated)
  base: ({headerPart, headerColor}) => ({
    padding: system.padding.md,
    boxShadow: system.depth[2],
    backgroundColor: system.color.bg.default,
    color: system.color.fg.default,
    // Targets the header part via [data-part="themed-card-header"]
    [headerPart]: {
      color: headerColor, // headerColor === '--headerColor-<hash>', NOT ''
    },
  }),
  modifiers: {
    isDarkTheme: {
      // If the prop `isDarkTheme` is true, style the component and its parts
      true: ({headerPart, bodyPart}) => ({
        backgroundColor: system.color.surface.contrast.default,
        color: system.color.fg.inverse,
        [`${headerPart}, ${bodyPart}`]: {color: system.color.fg.inverse},
      }),
    },
  },
});
```

In render — pass dynamic props to the stencil, spread parts onto sub-elements:

```tsx
<Card cs={themedCardStencil({isDarkTheme: darkTheme, headerColor})}>
  <Card.Heading {...themedCardStencil.parts.header}>Canvas Supreme</Card.Heading>
  <Card.Body {...themedCardStencil.parts.body}>...</Card.Body>
</Card>
```

### `base` — object OR function

- **Object form** — use when base references no vars/parts: `base: {padding: 5}`.
- **Function form** — `base: ({someVar, somePart}) => ({...})`. The function receives **resolved CSS var
  names** (e.g. `'--someVar-abc123'`) and **part selectors** (`someName` -> `someNamePart` =
  `'[data-part="..."]'`). **Required whenever you reference `vars` or `parts`** (Stencils.mdx 51–57).
- Base styles are ALWAYS applied; they support pseudo/child selectors (Stencils.mdx 43–48).

### `vars` — dynamic CSS custom properties

```tsx
const myStencil = createStencil({
  vars: {
    defaultColor: 'red', // has a default -> creates a "cascade barrier"
    nonDefaultedColor: '', // uninitialized -> cascades into the component
  },
  base: ({defaultColor}) => ({color: defaultColor}), // defaultColor === '--defaultColor-<hash>'
});

myStencil({defaultColor: 'blue'}); // -> {style: {'--defaultColor-<hash>': 'blue'}}
```

- Element `style` wins over the class (highest specificity), so passing a var value overrides `base`.
- **Defaulted var** (non-empty) = **cascade barrier**; prevents a parent's var leaking into a nested
  same-stencil child, e.g. nested Cards (Stencils.mdx 119–137).
- **Uninitialized var** (`''`) = **cascades**; expects a parent to set it (e.g. Button -> SystemIcon).
  Always give a fallback when reading it: `cssVar(color, 'red')` (Stencils.mdx 139–152).
- **Nested vars** (one level deep) for pseudo states (Stencils.mdx 155–182):
  ```tsx
  vars: {default: {color: 'red'}, hover: {color: 'blue'}, focus: {color: 'orange'}}
  ```
- Vars **share the modifier namespace** — do not name a var and a modifier the same unless intentional
  (see "var + modifier sharing a key" below).

### `modifiers` — appearance variations (each = its own class)

```tsx
const buttonStencil = createStencil({
  base: {padding: 5},
  modifiers: {
    variant: {
      // modifier name
      primary: {background: 'blue'},
      secondary: {background: 'gray'},
    },
  },
  defaultModifiers: {variant: 'secondary'}, // applied when prop not passed
});

buttonStencil({variant: 'primary'}); // {className: "css-a0 css-a1"}
buttonStencil(); // {className: "css-a0 css-a2"} (default applied)
```

- Modifier values may be objects OR functions (when they need vars/parts), exactly like `base`.
- **Boolean modifiers use the literal key `true`** (see `isDarkTheme.true` above).

### `compound` — styles at the intersection of 2+ modifiers

```tsx
const buttonStencil = createStencil({
  base: {padding: 10},
  modifiers: {
    size: {large: {padding: 20}, small: {padding: 5}},
    iconPosition: {start: {paddingInlineStart: 5}, end: {paddingInlineEnd: 5}},
  },
  compound: [
    {modifiers: {size: 'large', iconPosition: 'start'}, styles: {paddingInlineStart: 15}},
    {modifiers: {size: 'small', iconPosition: 'end'}, styles: {paddingInlineEnd: 0}},
  ],
});
```

- Each compound entry makes a NEW class applied only when **all** its modifiers match.
- **Precedence (MergingStyles.mdx 149–157):** all stencil classes are `0-1-0`; injection order is
  `base` -> `modifiers` (in order) -> `compound` (in order). **Last defined wins**, so a `compound`
  overrides a `modifier`, which overrides `base`, for the same property.

### var + modifier sharing a key (Stencils.mdx 328–359)

A var and a modifier may share a name. The stencil accepts either the modifier option (autocomplete) or
an arbitrary string; the **value is always emitted as the var**, while the **modifier class only applies
on a valid modifier key**:

```tsx
const s = createStencil({
  vars: {width: '10px'},
  base: ({width}) => ({width}),
  modifiers: {width: {zero: {width: '0'}}},
});

s({width: 'zero'}); // {className: 'css-button css-button--width-zero', style: {'--width-…': 'zero'}}
s({width: '10px'}); // {className: 'css-button',                        style: {'--width-…': '10px'}}
```

### `parts` — style non-semantic sub-elements

`parts: {icon: 'my-button-icon'}` gives you:

- `iconPart` (= `'[data-part="my-button-icon"]'`) inside config functions, and
- `stencil.parts.icon` (= `{'data-part': 'my-button-icon'}`) to spread onto the element in render.

Use sparingly — **parts raise specificity**; never put a part on a nested element that has its own
stencil (Stencils.mdx 361–448).

### `extends` — composition / inheritance

Inherit `base`, `modifiers`, and `vars` from another stencil, then customize. Verbatim from
`modules/styling/stories/mdx/examples/CustomButton.tsx`:

```tsx
import {buttonStencil} from '@workday/canvas-kit-react/button';
import {systemIconStencil} from '@workday/canvas-kit-react/icon';
import {createStencil, px2rem} from '@workday/canvas-kit-styling';
import {base, system} from '@workday/canvas-tokens-web';

const myButtonStencil = createStencil({
  extends: buttonStencil,
  base: {
    [buttonStencil.vars.background]: base.green100, // override exposed stencil vars
    [buttonStencil.vars.label]: base.green700,
    [systemIconStencil.vars.color]: base.green700,
    [buttonStencil.vars.borderRadius]: px2rem(2),
    border: `${px2rem(3)} solid transparent`,
    width: 'fit-content',
    '&:hover': {
      [buttonStencil.vars.background]: base.green600,
      border: `${px2rem(3)} dotted ${base.green700}`,
      [systemIconStencil.vars.color]: base.green700,
    },
    '&:active': {
      [buttonStencil.vars.background]: base.green700,
      [buttonStencil.vars.label]: system.color.fg.inverse,
      [systemIconStencil.vars.color]: system.color.fg.inverse,
    },
  },
  modifiers: {
    size: {
      small: {padding: system.padding.md},
      medium: {padding: system.padding.xl},
      large: {padding: system.padding.xxl},
    },
  },
});
```

- A component stencil **exposes its vars at `stencil.vars.<name>`** so extenders override them by writing
  `[stencil.vars.x]: value`. This is how you re-theme Button, SystemIcon, etc.
- See also `CustomIcon.tsx`: `extends: systemIconStencil`, then set `[systemIconStencil.vars.color]`,
  `[systemIconStencil.vars.accentColor]`, `[systemIconStencil.vars.size]` from `system`/`component` tokens.
- **Hot-reload caveat (Overview.mdx 89–130):** with cross-file `extends`, editing the base file's styles
  can cause merge issues on hot reload. **Keep tightly-coupled stencils in one file** when possible.

---

## `createVars`

Signatures (cs.ts 298–335): `createVars(...names: string[])`, or `createVars({id, args})`, or a
defaulted-object form. Returns a function plus a map of `name -> '--name-<hash>'`. Verbatim from
`examples/CreateVars.tsx`:

```tsx
import {createStyles, createVars, cssVar} from '@workday/canvas-kit-styling';

const myVars = createVars('background'); // myVars.background === '--background-<hash>'

const styles = createStyles({
  width: 100,
  height: 100,
  backgroundColor: cssVar(myVars.background), // var(--background-<hash>)
});

// apply VALUES via style:
<div className={styles} style={myVars({background: 'gray'})} />; // {'--background-<hash>': 'gray'}
```

Use `createVars` for standalone variables **outside** a stencil; inside a stencil prefer the `vars` config.

---

## `cssVar` (with fallbacks)

Signature (cs.ts 267–274): `cssVar(input, fallback?)`.

```tsx
cssVar(myVars.color);          // 'var(--color-<hash>)'
cssVar(myVars.color, 'red');   // 'var(--color-<hash>, red)'
cssVar(myVars.color, otherVar); // 'var(--color-<hash>, var(--other-<hash>))'  (a -- fallback is wrapped)
```

- **Use a fallback whenever a var may be uninitialized (`''`).** Otherwise it falls back to `initial`
  (Stencils.mdx 139–152).
- A token path like `cssVar(system.color.bg.primary.default)` resolves to
  `var(--cnvs-sys-color-bg-primary-default)`.
- If the project uses the styling-transform fallback files, fallbacks can be auto-filled at parse time
  (cs.ts 263–266).

---

## `px2rem`

Source `px2rem.ts`: `px2rem(px: number, base = 16): string` -> `` `${px / base}rem` ``.

```ts
import {px2rem} from '@workday/canvas-kit-styling';

px2rem(1);   // '0.0625rem'
px2rem(2);   // '0.125rem'
px2rem(400); // '25rem'

// in styles:  margin: px2rem(2),
```

---

## `calc.*`

Source `calc.ts`. All helpers **auto-wrap `--var` args in `var()`**. Exports are
`add, subtract, multiply, divide, negate` — there is no standalone `calc.add` package, just this set.

```ts
import {calc} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

calc.add(system.padding.xxs, '0.125rem');      // 'calc(var(--cnvs-sys-padding-xxs) + 0.125rem)'
calc.subtract(system.padding.xxs, '0.125rem'); // 'calc(var(--cnvs-sys-padding-xxs) - 0.125rem)'
calc.multiply(system.padding.xxs, 3);          // 'calc(var(--cnvs-sys-padding-xxs) * 3)'
calc.divide(system.padding.xxs, 2);            // 'calc(var(--cnvs-sys-padding-xxs) / 2)'
calc.negate(system.gap.md);                    // 'calc(var(--cnvs-sys-gap-md) * -1)'
```

Real usage (LoadingDots): `animationDuration: calc.multiply('150ms', 35)`.

---

## `colorSpace.*`

Source `colorSpace.tsx`. Produces `color-mix(in srgb, ...)`. Exports: `darken, hover, pressed`.

- `colorSpace.darken({color, fallback, mixinColor, mixinValue})` — generic mix.
- `colorSpace.hover({color, fallback?, colorType?})` — `colorType: 'accent' | 'surface'` (default
  `'accent'`); mixes with `system.color[colorType].overlay.mixin` at `system.opacity[colorType].hover`.
- `colorSpace.pressed({color, fallback?, colorType?})` — same, using `…opacity[colorType].pressed`.

```tsx
import {colorSpace, createStyles} from '@workday/canvas-kit-styling';
import {brand, system} from '@workday/canvas-tokens-web';

const styles = createStyles({
  backgroundColor: system.color.brand.accent.primary,
  '&:hover': {
    backgroundColor: colorSpace.hover({
      color: system.color.brand.accent.primary,
      fallback: brand.primary800,
      colorType: 'accent',
    }),
  },
  '&:active': {
    backgroundColor: colorSpace.pressed({
      color: system.color.brand.accent.primary,
      fallback: brand.primary800,
      colorType: 'accent',
    }),
  },
});
```

Use these for interactive button/link states (Utilities.mdx 106–208).

---

## The `cs` prop

The `cs` prop is on virtually all Canvas components. It accepts a class string (from `createStyles`), a
stencil return, a `createVars` return, a style object, or an **array** of these — and merges them into
`className` + `style` (Overview.mdx 276–296).

```tsx
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {createStyles} from '@workday/canvas-kit-styling';
import {base, system} from '@workday/canvas-tokens-web';

const styles = createStyles({color: base.red600});

<PrimaryButton cs={styles}>Text</PrimaryButton>;
<PrimaryButton cs={[styles, themedStencil({size: 'large'}), {marginTop: system.gap.md}]} />;
```

> **Performance warning (Overview.mdx 283–286):** passing a raw **style object** to `cs` is NOT treated
> as static styling and forfeits the perf benefit. Prefer `createStyles`/`createStencil` outputs; inline
> objects are convenient but runtime-merged.

---

## `mergeStyles` and `handleCsProp`

- **`handleCsProp(elemProps, stencilOrStyles)`** (from `@workday/canvas-kit-styling`) — the function to
  use **when building your OWN component**. Merges `className`, `style`, and the `cs` prop, and handles
  Emotion interop (single-class merge mode when `@emotion/react`/`styled` is detected)
  (MergingStyles.mdx 13–45). This is what Canvas components use internally.
  ```tsx
  <button {...handleCsProp(elemProps, myButtonStencil({size}))} />
  ```
- **`mergeStyles(props, [styles])`** (from `@workday/canvas-kit-react/layout`) — **deprecated** in v15;
  exists for backwards compat with `@emotion/styled` / `css` prop merging. Precedence it enforces:
  `createStyles > CSS Prop > Styled Component > Style props` (MergingStyles.mdx 47–166). **Prefer
  `handleCsProp`**; avoid introducing `styled` / the `css` prop into your tree (forces runtime merge mode).

---

## The `createComponent` factory (the Canvas idiom)

From `modules/react/common/lib/utils/components.ts` (491–556). Signature:

```ts
createComponent(as?)( // `as` = element string ('button'), a component, or undefined
  {displayName?, Component, subComponents?}
);
// Component is a ref-forwarding fn: (props, ref, Element) => JSX
```

`Element` is whatever was passed to `as` (defaults to the `as` element); render it and spread the merged
props. Canonical full component (from `CustomButton.tsx`):

```tsx
import {createComponent} from '@workday/canvas-kit-react/common';
import {handleCsProp} from '@workday/canvas-kit-styling';
import {PrimaryButtonProps, buttonStencil} from '@workday/canvas-kit-react/button';

const MyButton = createComponent('button')({
  displayName: 'MyButton',
  Component: ({children, size, ...elemProps}: PrimaryButtonProps, ref, Element) => (
    <Element ref={ref} {...handleCsProp(elemProps, myButtonStencil({size}))}>
      {children}
    </Element>
  ),
});
```

Minimal version with just the `CSProps` type (from LoadingDots, Utilities.mdx 264–269):

```tsx
import {createComponent} from '@workday/canvas-kit-react/common';
import {CSProps, createStencil, handleCsProp} from '@workday/canvas-kit-styling';

export const LoadingDot = createComponent('div')({
  displayName: 'LoadingDots',
  Component: ({...elemProps}: CSProps, ref, Element) => (
    <Element ref={ref} {...handleCsProp(elemProps, loadingStencil())} />
  ),
});
```

- `subComponents` lets a container expose `Foo.Bar` (auto-`displayName`d as `Foo.Bar`)
  (components.ts 322–335). Used for compound components.
- `CSProps` (from `@workday/canvas-kit-styling`) is the prop type that gives a component the
  `cs` / `className` / `style` props.

---

## COMPLETE worked example — a brand-new component, end-to-end

A small composed status `Badge` built entirely in the Canvas idiom: stencil at module scope, `vars` for a
cascading color, `modifiers` for variations, a `compound` for an intersection, a `part` for the dot,
tokens for every value, and `createComponent` + `handleCsProp` to wire it up. **Export the stencil** so
consumers can `extends` it.

R3's recipe (B.11) followed step by step:

> 1. Define a stencil at module scope. Put `vars` only for props that must override across selectors;
>    everything else as `modifiers`. 2. Use `system.*`/`base.*`/`brand.*`/`component.*` tokens for all
>    values; wrap math in `calc.*`, sizes in `px2rem`, interactive colors in `colorSpace.*`. 3. Build the
>    component with `createComponent('element')({displayName, Component})`. 4. In `Component`, destructure
>    modifier props, pass them to the stencil, spread `handleCsProp(elemProps, fooStencil({...modifiers}))`
>    onto `Element`. 5. Spread `fooStencil.parts.x` onto any sub-elements styled via parts. 6. Export the
>    stencil too.

```tsx
'use client'; // Canvas components inject styles at import time -> must be a Client Component

import {createComponent} from '@workday/canvas-kit-react/common';
import {
  createStencil,
  handleCsProp,
  cssVar,
  px2rem,
  calc,
  type CSProps,
} from '@workday/canvas-kit-styling';
import {system, base} from '@workday/canvas-tokens-web';

// 1. Stencil at MODULE SCOPE (never inside render).
//    `vars` for the one value that must cascade into the dot part; everything else is a modifier.
//    Export it so consumers can `extends: statusBadgeStencil` or target `statusBadgeStencil.vars.*`.
export const statusBadgeStencil = createStencil({
  vars: {
    // Uninitialized -> cascades; each modifier sets it. Read with a fallback.
    accentColor: '',
  },
  parts: {
    dot: 'status-badge-dot',
  },
  // base is a FUNCTION because it references vars (accentColor) and a part (dotPart).
  base: ({accentColor, dotPart}) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: system.gap.xxs,
    paddingInline: system.padding.xs,
    blockSize: px2rem(24),
    borderRadius: system.shape.full,
    fontFamily: system.fontFamily.default,
    fontSize: system.type.body.small,
    fontWeight: system.fontWeight.medium,
    color: system.color.fg.default,
    backgroundColor: system.color.bg.alt.soft,
    // The dot sub-element: [data-part="status-badge-dot"]
    [dotPart]: {
      inlineSize: px2rem(8),
      blockSize: px2rem(8),
      borderRadius: system.shape.round,
      // Fall back to fg.default if no modifier set the var.
      backgroundColor: cssVar(accentColor, system.color.fg.default),
    },
  }),
  modifiers: {
    // Each value is a FUNCTION because it writes the `accentColor` var.
    tone: {
      positive: ({accentColor}) => ({[accentColor]: system.color.fg.positive.default}),
      caution: ({accentColor}) => ({[accentColor]: system.color.fg.caution.default}),
      critical: ({accentColor}) => ({[accentColor]: system.color.fg.critical.default}),
    },
    emphasis: {
      // Boolean modifier uses the literal `true` key.
      true: ({accentColor}) => ({
        color: system.color.fg.inverse,
        // Tint the whole pill from the accent var.
        backgroundColor: cssVar(accentColor, system.color.bg.muted.default),
      }),
    },
  },
  // Intersection: high-emphasis + critical needs extra inline padding for the louder fill.
  // compound is injected LAST -> wins over base and the matching modifiers.
  compound: [
    {
      modifiers: {tone: 'critical', emphasis: true},
      styles: {paddingInline: calc.add(system.padding.xs, px2rem(2))},
    },
  ],
  defaultModifiers: {tone: 'positive'},
});

// 2. Type the component's own props on top of CSProps (gives it cs/className/style).
export interface StatusBadgeProps extends CSProps {
  /** Semantic tone — drives the dot + (when emphasized) the fill color. */
  tone?: 'positive' | 'caution' | 'critical';
  /** Solid, high-contrast treatment. */
  emphasis?: boolean;
  children: React.ReactNode;
}

// 3 + 4. Build with createComponent('span'); spread handleCsProp(elemProps, stencil({...modifiers})).
//        5. Spread the dot part onto the sub-element.
export const StatusBadge = createComponent('span')({
  displayName: 'StatusBadge',
  Component: ({tone, emphasis, children, ...elemProps}: StatusBadgeProps, ref, Element) => (
    <Element ref={ref} {...handleCsProp(elemProps, statusBadgeStencil({tone, emphasis}))}>
      <span {...statusBadgeStencil.parts.dot} />
      {children}
    </Element>
  ),
});
```

Usage:

```tsx
<StatusBadge tone="positive">Active</StatusBadge>
<StatusBadge tone="caution">Pending review</StatusBadge>
<StatusBadge tone="critical" emphasis>Overdue</StatusBadge>

// The `cs` prop still composes on top (last-defined wins):
<StatusBadge tone="positive" cs={{marginInlineStart: system.gap.sm}}>Active</StatusBadge>
```

Why this is correct, mapped to the rules:

- **Module scope** — the stencil is defined once at import time, not in render.
- **`base` and modifier values are functions** — they reference `accentColor`/`dotPart`, whose real names
  are runtime-generated.
- **`vars` for the cascading value, `modifiers` for variations** — `accentColor` is read inside the `dot`
  part selector and the `emphasis` fill, so it must be a var; tone/emphasis are appearance modifiers.
- **`cssVar(accentColor, fallback)`** — `accentColor` is uninitialized (`''`), so every read supplies a
  fallback.
- **`compound` wins** — `tone: 'critical' + emphasis: true` is injected last, overriding the inline
  padding from `base`.
- **`handleCsProp`** — merges the stencil with any incoming `cs`/`className`/`style` so the component is a
  well-behaved Canvas citizen.

---

## Import-path cheat sheet

| Symbol | Import from |
|---|---|
| `createStyles`, `createStencil`, `createVars`, `cssVar`, `px2rem`, `calc`, `colorSpace`, `handleCsProp`, `keyframes`, `injectGlobal`, `getCache`, `createInstance`, `CSProps` | `@workday/canvas-kit-styling` |
| `createComponent`, `CanvasProvider` | `@workday/canvas-kit-react/common` |
| `mergeStyles` (deprecated) | `@workday/canvas-kit-react/layout` |
| `base, brand, system, component` (token objects) | `@workday/canvas-tokens-web` |
| `buttonStencil`, `PrimaryButtonProps` | `@workday/canvas-kit-react/button` |
| `systemIconStencil`, `SystemIcon` | `@workday/canvas-kit-react/icon` |

> Ground truth: `C:\Users\kyled\canvas-kit\modules\styling\{lib,stories/mdx,stories/mdx/examples}` and
> `modules\react\common\lib\utils\components.ts`. Quoted line refs trace to R3 Part B.
