---
name: convert
description: Refactor existing AI-generated UI into real Workday Canvas Kit. Maps raw elements to Canvas components (button → PrimaryButton/SecondaryButton, input → FormField + TextInput, a div "card" → Card, select → Select, dialog → Modal), replaces hardcoded hex/px with cssVar(system.*) tokens, wires the signature focus ring + ARIA, and preserves all existing behavior, props, and handlers. Invoke for "/canvasmith:convert", or when the user wants to make existing JSX/HTML look and behave Workday-native, "convert this to Canvas Kit", "use real Canvas components here", or "de-Tailwind this into Canvas". Works on a file, a component, or a selection.
user-invokable: true
license: MIT
args:
  - name: target
    description: A file path or component name to convert. If omitted, convert the file/component currently in focus or the code the user pasted.
    required: false
---

# /canvasmith:convert — refactor AI UI into Canvas Kit

Take existing, generic AI-generated front-end (raw `<button>`/`<input>`/`<div className="card">`,
Tailwind/utility classes, inline hex/px styles) and rebuild it with **real Canvas Kit components** and
**`cssVar(system.*)` tokens**, keeping every behavior, prop, handler, and bit of state intact. The
result should look like it was written by the Workday team.

Pinned packages (never drift): `@workday/canvas-kit-react@15.0.6`,
`@workday/canvas-kit-styling@15.0.6`, `@workday/canvas-kit-preview-react@15.0.6`,
`@workday/canvas-tokens-web@4.3.0`, `@workday/canvas-system-icons-web@4.0.4`,
`@workday/canvas-kit-react-fonts`; `@emotion/react` ^11.7; React 18.

Reference, when you need prop tables or exact token paths:
**`../canvas-ui/reference/components.md`** (component APIs + nesting rules) and
**`../canvas-ui/reference/tokens.md`** (raw value → nearest token). For deeper token mapping, the
`/canvasmith:tokens` skill maps arbitrary colors/spacing; for a brand-new component use
`/canvasmith:component`.

## Preconditions

Before converting, confirm the project is set up (token CSS imported, `CanvasProvider` mounted, fonts
injected, emotion SSR registry for Next.js App Router). If not, run `/canvasmith:init` first — Canvas
components render unstyled without the four token `_variables.css` imports. Files using Canvas
components in Next.js App Router must start with `'use client'`.

## The conversion process (do these in order)

1. **Read & inventory.** Open the target. List every raw element, utility-class cluster, inline style,
   icon, and the behavior attached to each (handlers, state, `value`/`onChange`, `disabled`, `aria-*`,
   `href`, `type`). Nothing in this inventory may be lost.
2. **Map elements → Canvas components** using the table below. Pick the closest semantic match; prefer
   Preview equivalents where the main one is deprecated.
3. **Fix the nesting.** Canvas has strict composition rules (e.g. `FormField` wraps inputs, but
   `Select` wraps `FormField`). Restructure JSX to match — see "Nesting rules" below.
4. **Replace hardcoded values → tokens.** Every hex, rgb, and px becomes a `system.*` token via
   `cssVar`. Move surviving custom styles into a module-scope `createStyles(...)` and apply with `cs`.
   Delete utility-class strings once their intent is reproduced with tokens/components.
5. **Wire focus + ARIA.** Canvas components carry the signature `:focus-visible` ring and model-driven
   ARIA for free — so prefer them over hand-rolled focus CSS. Add required `aria-label`s
   (icon-only buttons, close icons, `Breadcrumbs`/`Pagination` containers) and link labels via
   `FormField`. Remove now-redundant `outline: none`.
6. **Preserve behavior.** Re-attach every handler/prop to the new component (`onClick`, `onChange`,
   `value`, `disabled`, `type`, `name`, `href`, `aria-*`). Keep component state and logic byte-for-byte;
   only the presentation layer changes.
7. **Clean imports.** Add per-module imports (`@workday/canvas-kit-react/<module>`), token object
   (`{system} from '@workday/canvas-tokens-web'`), styling helpers, and icons. Remove dead CSS/classes.
8. **Verify.** Re-check the inventory: same actions, same data flow, no orphaned handlers, no raw
   hex/px left, correct nesting, a11y intact.

## Element → Canvas component mapping

| AI / raw element | Canvas Kit replacement | Import |
|---|---|---|
| `<button>` primary CTA | `PrimaryButton` | `@workday/canvas-kit-react/button` |
| `<button>` secondary / outlined | `SecondaryButton` | `…/button` |
| `<button>` text / ghost | `TertiaryButton` (icon-only → pass `icon` + `aria-label`) | `…/button` |
| destructive `<button>` | `DeleteButton` | `…/button` |
| `<a>` link | `Hyperlink` (external → `ExternalHyperlink`) | `…/button` |
| `<input type=text/email/...>` | `FormField` + `<FormField.Input as={TextInput}/>` | `…/form-field`, `…/text-input` |
| `<textarea>` | `<FormField.Input as={TextArea}/>` | `…/text-area` |
| `<select>` / dropdown | `Select` (wraps `FormField`) with `Select.Input/.Popper/.Card/.List/.Item` | `…/select` |
| `<input type=checkbox>` | `Checkbox` (`label` prop) | `…/checkbox` |
| `<input type=radio>` group | `RadioGroup` + `RadioGroup.RadioButton` | `…/radio` |
| toggle / `role=switch` | `Switch` (Preview) | `@workday/canvas-kit-preview-react/switch` |
| `<div className="card">` | `Card` + `Card.Heading` + `Card.Body` | `…/card` |
| modal / dialog overlay | `Modal` (`Modal.Overlay/.Card/.Heading/.Body/.CloseIcon/.CloseButton`) | `…/modal` |
| anchored popover/dialog | `Dialog` (`Dialog.Target/.Popper/.Card/…`) | `…/dialog` |
| dropdown menu | `Menu` (`Menu.Target/.Popper/.Card/.List/.Item`) | `…/menu` |
| tabs | `Tabs` (`Tabs.List/.Item/.Panel`) | `…/tabs` |
| `<table>` | `Table` (`Table.Head/.Body/.Row/.Header/.Cell`) | `…/table` |
| breadcrumbs | `Breadcrumbs` (needs `aria-label`) | `…/breadcrumbs` |
| pagination | `Pagination` (needs `aria-label`) | `…/pagination` |
| alert / inline banner | `Banner` (`hasError`) or `InformationHighlight` | `…/banner`, `…/information-highlight` |
| toast / snackbar | `Toast` (in a `Popper`) | `…/toast` |
| status pill/badge | `StatusIndicator` (Preview) / `CountBadge` / `Pill` | `…preview-react/status-indicator`, `…/badge`, `…/pill` |
| spinner / skeleton | `LoadingDots` / `Skeleton` | `…/loading-dots`, `…/skeleton` |
| avatar / user image | `Avatar` | `…/avatar` |
| icon (`<svg>`/icon font) | `SystemIcon` (`icon=` from `@workday/canvas-system-icons-web`) | `…/icon` |
| `<h1>…<h6>` / headings | `Title` / `Heading` (`as`, `size`) | `…/text` |
| `<p>` / body text | `BodyText` / `Subtext` / `Text` (`typeLevel`) | `…/text` |
| layout `<div>` flex/grid | `Flex` / `Grid` / `Box` (`cs` + `system.space.*`) | `…/layout` |

## Nesting rules that trip people up

- **`FormField` wraps every labeled input** — `FormField > FormField.Label + <FormField.Input as={TextInput}/>`,
  with hint/error text in `FormField.Hint`. Use `error="error"|"caution"` for validation; never a bare
  `<TextInput>` for a labeled field.
- **`Select` wraps `FormField`** (inverted): `Select > FormField > FormField.Label > FormField.Field >
  Select.Input + Select.Popper > Select.Card > Select.List`.
- **`Popup` has NO default behaviors** — if you map an ad-hoc popover to `Popup`, you must add
  `useCloseOnOutsideClick`, `useCloseOnEscape`, `useInitialFocus`, `useReturnFocus`. `Modal`/`Dialog`
  give these for free, so prefer them for dialogs.
- **Collection items use `data-id`** (Tabs, Menu, SegmentedControl, Breadcrumbs) to wire selection/panels.
- **Icon-only buttons & all `*.CloseIcon` require `aria-label`**; `Breadcrumbs`/`Pagination` containers
  require `aria-label`.

## Token replacement (raw value → token)

Replace surviving styles with module-scope `createStyles` using `cssVar(system.*)`; apply via `cs`.

```tsx
// BEFORE (AI/Tailwind)
<button className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700">Save</button>

// AFTER (Canvas — behavior preserved, tokens + real component)
import {PrimaryButton} from '@workday/canvas-kit-react/button';
<PrimaryButton onClick={save}>Save</PrimaryButton>   // pill shape, focus ring, hover all built in
```

```tsx
// BEFORE
<div style={{padding: '24px', background: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.1)'}}>…</div>

// AFTER
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
const panel = createStyles({
  padding: system.space.x6,                 // 24px
  backgroundColor: system.color.bg.default, // #ffffff
  borderRadius: system.shape.x2,            // 8px
  boxShadow: system.depth[1],
});
<Box cs={panel}>…</Box>
```

Common mappings (full table in `../canvas-ui/reference/tokens.md`):
- `#ffffff`/white bg → `system.color.bg.default`; subtle panel → `system.color.bg.alt.default`.
- Body text color → `system.color.fg.default`; secondary → `system.color.fg.muted.default`;
  on-dark/primary → `system.color.fg.inverse`.
- Brand blue → `system.color.bg.primary.default`; focus ring blue → `system.color.border.primary.default`.
- Borders → `system.color.border.default` / `system.color.border.input.default`.
- Spacing 4/8/12/16/24/32px → `system.space.x1/x2/x3/x4/x6/x8` (or `system.gap.*` / `system.padding.*`).
- Radius 4/8px → `system.shape.x1`/`x2`; pill → `system.shape.round`.

## DO / DON'T

- DO preserve all behavior — every handler, controlled `value`/`onChange`, `disabled`, `type`, `name`,
  `href`, and `aria-*` survives the refactor.
- DO prefer components over re-creating their look with `cs` (a `PrimaryButton` already has the pill,
  hover, focus ring, and a11y).
- DO use **logical properties** in surviving styles (`paddingInline`, `marginBlockStart`) for RTL.
- DO use the `Text`/`Heading`/`BodyText` components instead of raw font-size/weight on `<h*>`/`<p>`.
- DO convert incrementally and re-verify the inventory after each cluster.
- If the file being converted is a top-level page or screen (a default export from a route file, or a component with full-viewport layout), check whether the root layout already mounts `<AppShell>`. If yes: emit only the page body. If no: tell the user to run `/canvasmith:init` first; never invent a shell from raw markup.
- For sub-components and primitives, never introduce `<AppShell>` — keep them shell-agnostic.
- DON'T leave raw hex/rgb/px or utility classes once their intent is reproduced with tokens/components.
- DON'T hand-roll `:focus`/`outline: none` — let the Canvas component's `:focus-visible` ring stand.
- DON'T change logic, data fetching, routing, or state shape — this is presentation-only.
- DON'T flatten Canvas nesting (e.g. dropping `FormField.Field`, or putting `FormField` outside
  `Select`) — follow the nesting rules.
- DON'T use deprecated mains (`Switch`, `StatusIndicator`, class `RadioGroup`) — use Preview.

## Output checklist

- [ ] Every raw element mapped to its Canvas component (or `Box`/`Flex`/`Grid` for layout).
- [ ] Correct Canvas nesting (`FormField` wraps inputs; `Select` wraps `FormField`; `data-id` on collection items).
- [ ] All hardcoded hex/rgb/px replaced with `cssVar(system.*)` tokens; surviving styles in module-scope `createStyles` applied via `cs`.
- [ ] Focus ring and ARIA come from the components; required `aria-label`s added; redundant `outline: none` removed.
- [ ] All behavior preserved — handlers, controlled state, `disabled`, `type`, `href`, `aria-*` re-attached.
- [ ] Imports added per-module; dead CSS/utility classes removed.
- [ ] `'use client'` present if Next.js App Router; project setup confirmed (or `/canvasmith:init` run).
