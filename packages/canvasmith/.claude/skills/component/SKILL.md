---
name: component
description: Scaffold a NEW component in the exact Canvas Kit idiom — createStencil({vars, base, modifiers}) + createComponent + cssVar(system.*) tokens, wired with handleCsProp, the signature Workday focus ring, size modifiers, a11y, and RTL logical properties. Invoke for "/canvasmith:component", or when the user wants to author a fresh, reusable, Workday-native component (button-like control, badge, card, field, layout primitive) from scratch rather than refactor existing markup. Produces production-grade TypeScript that looks like it shipped inside Canvas Kit itself.
user-invokable: true
license: MIT
args:
  - name: name
    description: The component name in PascalCase (e.g. StatCard, FilterPill, ToolbarAction). The stencil id and file name derive from this.
    required: true
  - name: description
    description: One line describing what the component is and its intended use, so the right modifiers/parts and tokens are chosen.
    required: false
---

# /canvasmith:component — scaffold a Canvas-idiomatic component

Author a brand-new component that is indistinguishable from one written by the Canvas Kit team:
a module-scope **`createStencil`** for styling, a **`createComponent`** factory for the element,
real **`cssVar(system.*)`** tokens for every value, **`handleCsProp`** to merge the user's `cs`/
`className`/`style`, the **signature Workday focus ring**, **size modifiers**, baked-in **a11y**, and
**RTL-safe logical properties**.

Pinned packages (never drift): `@workday/canvas-kit-react@15.0.6`,
`@workday/canvas-kit-styling@15.0.6`, `@workday/canvas-kit-preview-react@15.0.6`,
`@workday/canvas-tokens-web@4.3.0`, `@workday/canvas-system-icons-web@4.0.4`,
`@workday/canvas-kit-react-fonts`; `@emotion/react` ^11.7; React 18.

For the full styling deep-dive (vars vs. modifiers, compound, parts, `extends`, `calc`, `colorSpace`,
`createVars`, performance rules) read **`../canvas-ui/reference/styling.md`**. For prop tables of the
components you may want to extend, see **`../canvas-ui/reference/components.md`**.

## When to use this

- The user wants a NEW reusable control/primitive that does not exist in Canvas Kit (e.g. a stat card,
  a metric pill, a custom toolbar action, a labeled value).
- They want to **re-skin** an existing Canvas component with their own variants → use `extends` on the
  base component's exported stencil (e.g. `buttonStencil`, `systemIconStencil`).
- If they instead want to refactor existing AI markup into Canvas components, use `/canvasmith:convert`.
- If they want a whole screen, use `/canvasmith:build`.

## Decision: stencil shape (do this first)

1. **vars vs. modifiers** — A *modifier* is a finite, named set of appearance variations (a `variant`,
   a `size`, a boolean state). A *var* is a CSS custom property whose value must override across
   selectors (theming hook, a color a parent sets, a value passed at runtime). Rule of thumb: enumerable
   look → **modifier**; arbitrary/cascading value → **var**.
2. **size** — almost every interactive component gets a `size` modifier
   (`small | medium | large`, default `medium`). Drive padding/height/`type` off it.
3. **parts** — only for non-semantic sub-elements you must style (an inner icon slot, a decorative
   rail). Never put a part on a child that has its own stencil. Use sparingly (parts raise specificity).
4. **extends** — when you are theming an existing Canvas component, extend its stencil and write to its
   exposed vars (`[buttonStencil.vars.background]: base.green100`) instead of re-implementing it.
5. **focus** — interactive components MUST render the signature double focus ring on `:focus-visible`
   (see skeleton). Containers/text usually don't.

## DO / DON'T

- DO call `createStencil` / `createStyles` at **module scope**, never inside render (calling inside
  render injects a new sheet every render — a real perf bug).
- DO use `system.*` tokens for every color, space, radius, type, and depth value. Wrap math in
  `calc.*`, raw pixels in `px2rem`, interactive color states in `colorSpace.hover/.pressed`.
- DO use **logical properties** (`paddingInline`, `marginBlockStart`, `insetInlineStart`) so the
  component mirrors in RTL automatically. Canvas sets `dir` via `CanvasProvider`.
- DO spread `handleCsProp(elemProps, fooStencil({...modifiers}))` onto the rendered `Element` so the
  consumer's `cs` always wins.
- DO `export` the stencil so consumers can `extends` it or target `fooStencil.vars.*`.
- DO put icon-only controls behind a required `aria-label` and keep a transparent `outline` for
  Windows High Contrast Mode.
- DON'T pass a raw style object to `cs` for the component's own styles — that forfeits static styling.
- DON'T hardcode hex/px (`#0875e1`, `16px`, `border-radius: 9999px`) — map them to tokens.
- DON'T name a `var` and a `modifier` the same key unless you intentionally want the shared-key
  behavior (see styling.md §var+modifier).
- DON'T set `let`/loosely-typed style objects if the project uses the styling transform — values must
  be statically analyzable (`const`/`as const`).

## Token quick-reference (verbatim paths)

- Color: `system.color.fg.default/.strong/.muted.default/.inverse/.disabled`,
  `system.color.fg.primary.default`, `system.color.fg.critical.default`,
  `system.color.bg.default/.alt.default`, `system.color.bg.primary.default`,
  `system.color.border.default/.input.default`, `system.color.border.primary.default` (focus blue).
- Space: base unit 4px. `system.space.x1…x20` (x4 = 16px). Aliases: `system.gap.{xs,sm,md,lg}`,
  `system.padding.{xxs,xs,sm,md,lg,xl}`.
- Shape: `system.shape.x1` (4px), `system.shape.x2` (8px); pill = `system.shape.round`.
- Type: use the `Text`/`Heading`/`BodyText` components, or `system.type.{body,heading}.{sm,md,lg}`.
- Font weight: `system.fontWeight.{normal,medium,bold}`. Depth: `system.depth[1..6]`.

## The focus ring (signature Workday double ring — copy exactly)

Triggered on `:focus-visible` only. Inner inverse ring + outer brand-blue ring, with a transparent
`outline` kept for High Contrast Mode. The outer color resolves from `system.color.border.primary.default`.

```ts
'&:focus-visible': {
  outline: `${px2rem(2)} solid transparent`,
  boxShadow: [
    `inset 0 0 0 ${px2rem(2)} ${cssVar(system.color.border.input.inverse)}`,
    `0 0 0 ${px2rem(2)} ${cssVar(system.color.border.input.inverse)}`,
    `0 0 0 ${px2rem(4)} ${cssVar(system.color.border.primary.default)}`,
  ].join(', '),
},
```

## Ready-to-fill skeleton (replace the `__Tokens__`/placeholders for `<NAME>`)

```tsx
import * as React from 'react';
import {createComponent} from '@workday/canvas-kit-react/common';
import {SystemIcon, systemIconStencil} from '@workday/canvas-kit-react/icon';
import {
  createStencil,
  cssVar,
  px2rem,
  handleCsProp,
  type CSProps,
} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import type {CanvasSystemIcon} from '@workday/canvas-system-icons-web';

// 1) STENCIL — module scope. vars for cascading/overridable values, modifiers for finite variants.
export const <Name>Stencil = createStencil({
  vars: {
    // Uninitialized ('') vars cascade in; always read them with a fallback via cssVar(x, fallback).
    accentColor: '',
  },
  base: ({accentColor}) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: cssVar(system.gap.sm),
    boxSizing: 'border-box',
    // Logical props (RTL-safe): paddingInline/paddingBlock, never left/right.
    paddingInline: cssVar(system.padding.md),
    paddingBlock: cssVar(system.padding.xs),
    borderRadius: cssVar(system.shape.x1),
    border: `${px2rem(1)} solid ${cssVar(system.color.border.default)}`,
    backgroundColor: cssVar(system.color.bg.default),
    color: cssVar(system.color.fg.default),
    fontFamily: cssVar(system.fontFamily.default),
    // expose the cascading var with a sensible default
    [systemIconStencil.vars.color]: cssVar(accentColor, system.color.fg.muted.default),
    // SIGNATURE FOCUS RING (drop the focus block from SKILL.md here for interactive components)
    '&:focus-visible': {
      outline: `${px2rem(2)} solid transparent`,
      boxShadow: [
        `inset 0 0 0 ${px2rem(2)} ${cssVar(system.color.border.input.inverse)}`,
        `0 0 0 ${px2rem(2)} ${cssVar(system.color.border.input.inverse)}`,
        `0 0 0 ${px2rem(4)} ${cssVar(system.color.border.primary.default)}`,
      ].join(', '),
    },
    '&:disabled': {
      opacity: cssVar(system.opacity.disabled),
      cursor: 'not-allowed',
    },
  }),
  modifiers: {
    // Finite appearance variations → each is its own class. Functions only when they need vars/parts.
    size: {
      small: {paddingBlock: cssVar(system.padding.xxs), fontSize: cssVar(system.type.body.sm)},
      medium: {paddingBlock: cssVar(system.padding.xs), fontSize: cssVar(system.type.body.sm)},
      large: {paddingBlock: cssVar(system.padding.sm), fontSize: cssVar(system.type.body.md)},
    },
    emphasis: {
      low: {backgroundColor: cssVar(system.color.bg.default)},
      high: {
        backgroundColor: cssVar(system.color.bg.primary.default),
        color: cssVar(system.color.fg.inverse),
        borderColor: 'transparent',
      },
    },
  },
  // Fills in any modifier not explicitly passed.
  defaultModifiers: {size: 'medium', emphasis: 'low'},
  // compound: [{modifiers: {size: 'large', emphasis: 'high'}, styles: {paddingInline: cssVar(system.padding.lg)}}],
});

// 2) PROPS — extend CSProps so the component gets cs/className/style; add your own props + modifiers.
export interface <Name>Props extends CSProps {
  /** Leading decorative icon. */
  icon?: CanvasSystemIcon;
  /** Size of the component. */
  size?: 'small' | 'medium' | 'large';
  /** Visual emphasis. */
  emphasis?: 'low' | 'high';
  /** Accessible name — REQUIRED when there is no visible text (icon-only). */
  'aria-label'?: string;
  children?: React.ReactNode;
}

// 3) COMPONENT — createComponent('<element>')({displayName, Component}); forward ref, merge with handleCsProp.
export const <Name> = createComponent('div')({
  displayName: '<Name>',
  Component: ({icon, size, emphasis, children, ...elemProps}: <Name>Props, ref, Element) => (
    <Element ref={ref} {...handleCsProp(elemProps, <Name>Stencil({size, emphasis}))}>
      {icon ? <SystemIcon icon={icon} /> : null}
      {children}
    </Element>
  ),
});
```

### Variations to apply per case

- **Interactive control** → render `createComponent('button')`, keep the focus block, default
  `type="button"`, and require `aria-label` when icon-only.
- **Re-skin an existing component** → instead of a fresh stencil, `extends` the base:
  ```tsx
  import {buttonStencil, type PrimaryButtonProps} from '@workday/canvas-kit-react/button';
  export const BrandButtonStencil = createStencil({
    extends: buttonStencil,
    base: {
      [buttonStencil.vars.background]: system.color.bg.primary.default,
      [buttonStencil.vars.label]: system.color.fg.inverse,
      '&:hover': {[buttonStencil.vars.background]: system.color.bg.primary.strong},
    },
  });
  ```
- **Compound component** → add `subComponents: {Item: <Name>Item}` so consumers write `<Name>.Item`,
  and give styled sub-elements a `parts` entry, spreading `<Name>Stencil.parts.item` onto them.
- **Icon color** → set the consumed icon var (`[systemIconStencil.vars.color]: …`) rather than styling
  the SVG directly.

## Output checklist

- [ ] Stencil + component at module scope; nothing styling-related runs in render.
- [ ] `size` (and any other) modifiers with `defaultModifiers`.
- [ ] Every value is a `system.*` token via `cssVar` / `px2rem` / `calc` / `colorSpace` — zero raw hex/px.
- [ ] Logical properties only (no `left`/`right`/`margin-left`).
- [ ] Signature double focus ring on `:focus-visible` for interactive components; transparent `outline` kept.
- [ ] `handleCsProp(elemProps, stencil(...))` spread onto `Element`; `ref` forwarded.
- [ ] `CSProps`-based prop type; required `aria-label` for icon-only; disabled handled.
- [ ] Stencil is exported for `extends`/var overrides.
- [ ] `'use client'` at the top of the file if the project is Next.js App Router.
