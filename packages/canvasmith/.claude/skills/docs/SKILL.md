---
name: docs
description: Pull a real Workday Canvas Kit component's prop table, sub-components, import path, and usage example into context. Invoke for /canvasmith:docs COMPONENT (e.g. /canvasmith:docs FormField, /canvasmith:docs Table) before building or editing UI with that component, so generated code uses the correct API. Use when a user asks "how do I use <Canvas component>", "what props does X take", or "show the API for X".
user-invokable: true
license: MIT
args:
  - name: component
    description: The Canvas Kit component name to look up (e.g. FormField, Table, Menu, SidePanel, PrimaryButton, StatusIndicator).
    required: true
---

# /canvasmith:docs — load a Canvas Kit component's real API

Surface the **accurate, version-pinned** API for one `@workday/canvas-kit-react@15.0.6` component so the next code you write uses real props, real import paths, and the real compound/sub-component shape. Pull facts in this order of trust:

1. **`../canvas-ui/reference/components.md`** — the curated catalog (import roots, props, sub-components, gotchas, deprecations). Start here.
2. **Local Canvas Kit clone** at `C:/Users/kyled/canvas-kit` — ground truth. Read `modules/react/<module>/lib/*.tsx` for props and `modules/react/<module>/stories/examples/*.tsx` for canonical usage. For preview components read `modules/preview-react/<module>/…`.
3. **canvas.workdaydesign.com** (and the Storybook at workday.github.io/canvas-kit) — only to fill gaps the first two don't cover; verify anything from the web against the clone.

## Workflow

1. Normalize the `component` arg to its module (e.g. `FormField` -> `form-field`, `PrimaryButton` -> `button`, `StatusIndicator` -> preview `status-indicator`). Handle aliases and casing.
2. Pull the entry from `components.md`; if thin or missing, read the matching `lib/*.tsx` and one `stories/examples/*.tsx` from the clone.
3. Emit the brief in the output format below.
4. Surface gotchas and deprecations prominently — these are what make generated code wrong (see "Known gotchas").

## Output format

```
## <Component> — @workday/canvas-kit-react/<module>

Import:    import {<Component>} from '@workday/canvas-kit-react/<module>';
Construct: createComponent / createContainer (model: use<X>Model)  — note if compound

### Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| … | … | … | … |

### Sub-components (compound only)
- <Component>.Part — what it renders / does

### Usage
```tsx
// shortest correct, real example (from clone stories or components.md)
```

### Gotchas
- a11y requirements, nesting rules, deprecations, preview replacements

Tokens: every style override uses `cs={{…}}` with `cssVar(system.*)` — see /canvasmith:tokens.
```

Keep it tight: the prop table, the sub-components, ONE correct example, and the gotchas. Do not paste the whole source file.

## Known gotchas to always surface (when relevant to the component)

- **Theming is CSS token imports + `CanvasProvider`**, never a JS theme object. Style overrides go through the **`cs` prop** with `system.*` tokens.
- **`Select` WRAPS `FormField`** (inverted nesting); **`FormField` wraps every other input** via `<FormField.Input as={TextInput} />`. `Select` needs the `Select.Input` + `Select.Popper > Select.Card > Select.List` shape.
- **`Popup` has NO default behaviors** — opt in with `useCloseOnOutsideClick`, `useCloseOnEscape`, `useInitialFocus`, `useReturnFocus`. `Modal`/`Dialog` provide these automatically.
- **Deprecated in v15 -> use Preview:** `Switch`, `StatusIndicator`, class-based `RadioGroup`, `AccentIcon` -> `@workday/canvas-kit-preview-react/*`.
- **a11y required:** icon-only buttons and all `*.CloseIcon`/`Pill.IconButton`/overflow buttons need `aria-label`; `Breadcrumbs` and `Pagination` need a container `aria-label`. Collection items wire selection via `data-id`.
- **`Table` is CSS Grid** — set columns via `cs={{gridTemplateColumns: …}}`; use `scope` on `Table.Header` and `aria-labelledby` to a heading.
- Buttons share `ButtonProps` (`size`, `icon`, `iconPosition`, `grow`, `cs`) and are pills.

## DO / DON'T

- DO verify against the local clone before stating a prop or default; the clone is ground truth for v15.
- DO state the correct module import path and whether the component is compound (and its model hook).
- DO call out the preview-react replacement for any deprecated component.
- DON'T invent props or examples; if a fact isn't in the references or clone, say so rather than guess.
- DON'T dump the full source — one minimal, correct usage example is enough.
