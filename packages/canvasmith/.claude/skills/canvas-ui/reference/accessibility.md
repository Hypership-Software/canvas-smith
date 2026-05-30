# Canvas accessibility playbook

> How Canvas Kit v15 bakes accessibility in — and how to keep it. Verified against R4 §5 and the local clone at `C:\Users\kyled\canvas-kit`. The headline: **you get most of your a11y for free by using the real components as compounds.** Don't fight the models; lean on them.

## The one rule that prevents most violations

**Use the compound components as-is.** R4 §5.2: "Every interactive compound component has a `useXModel` hook ... The model holds `{state, events}`; subcomponents read it via context and merge ARIA props through `createElemPropsHook`. **This is the source of automatic accessibility** — you get it just by using the components."

Translation: when you render `<Modal>…</Modal>`, `<Tabs>…</Tabs>`, `<Menu>…</Menu>`, `<Select>…</Select>`, etc., the focus trap, roving tabindex, role wiring, and ARIA relationships are already correct. The fastest way to ship an inaccessible Canvas UI is to hand-roll these with raw `<div>`s and your own state.

---

## 1. The model / hook pattern (focus trap + roving tabindex + ARIA, for free)

Models are created with `createModelHook({defaultConfig, requiredConfig})`. Each subcomponent consumes the model from context and merges the ARIA/event props it needs.

| Component | Model hook | Auto-wired ARIA / behavior (R4 §5.2) |
|---|---|---|
| `Modal` | `useModalModel` (→ `usePopupModel` → `useDisclosureModel`) | focus trap, return focus to target, `role="dialog"`, `aria-modal`, `aria-labelledby` (Heading), close on Esc, hide sibling content from AT |
| `Dialog` | `useDialogModel` (→ `usePopupModel`) | popper positioning, return focus, `aria-labelledby`, close on outside click/Esc |
| `Popup` (base) | `usePopupModel` | `targetRef`, `stackRef`, `placement`, `initialFocusRef`, `returnFocusRef`, popup stack management |
| `Menu` | `useMenuModel` | `role="menu"`/`menuitem`, roving focus, type-ahead, `aria-expanded` on target, `onSelect({id})` |
| `Tabs` | `useTabsModel` (→ overflow list + menu sub-model) | `role="tab"`/`tabpanel`, `aria-selected`, `aria-controls`, arrow-key roving tabindex, overflow into a menu |
| `Select` | `useSelectModel` | combobox/listbox roles, keyboard select, `aria-activedescendant` |
| `SidePanel` | `useSidePanelModel` | `aria-labelledby`, toggle `aria-controls` + `aria-pressed` + `aria-describedby` |
| `FormField` | `useFormFieldModel` | label↔input↔hint `id` association, `aria-describedby`, `required` / `aria-invalid` via `error` |
| `Pagination` | `usePaginationModel` | nav landmark, current-page `aria-current` |

### Two usage variants (R4 §5.2)

- **Self-contained** — the model is created internally:
  ```tsx
  <Modal>…</Modal>
  ```
- **Hoisted model** — when you need to drive it programmatically (close on save, open from elsewhere):
  ```tsx
  const model = useModalModel();
  // ...
  <Modal model={model}>…</Modal>;
  model.events.hide(); // e.g. after a successful submit
  ```
  Same pattern for `useTabsModel`, `useMenuModel`, `usePaginationModel`, `useSidePanelModel`.

Config callbacks follow `on<Event>` / guards follow `should<Event>`: e.g. `onSelect`, `onPageChange`, `onStateTransition`, `shouldShow`.

**DO** hoist a model only when you need programmatic control. **DON'T** replicate any of the behaviors in the table by hand — re-implementing a focus trap or `role="tab"` wiring with raw elements throws away the guarantees and almost always regresses.

---

## 2. The signature double box-shadow focus ring

R4 §5.1: Canvas focus rings are a **two-layer inset/outset `box-shadow`** — an inner ring in an inverse/contrast color and an outer ring in the brand focus color, so the ring is visible on any background. The pattern (from `PrimaryButton`/`TextInput` stencils):

```css
box-shadow:
  inset 0 0 0 2px var(--cnvs-sys-color-border-input-inverse),   /* inner (white) */
  0 0 0 2px var(--cnvs-sys-color-border-input-inverse),
  0 0 0 4px var(--cnvs-brand-common-focus-outline);             /* outer (blue-500) */
outline: 2px solid transparent;                                  /* High Contrast Mode fallback */
```

Non-negotiables (R4 §5.1):

- **Triggered on `:focus-visible`** (keyboard), not `:focus` — mouse clicks don't show the ring. The components already do this; if you write a custom focusable element, key off `:focus-visible`.
- **Never remove `outline`.** Canvas keeps a transparent `outline` so **Windows High Contrast Mode** still renders focus. R4 §5.1: "**Do not remove `outline`** — Canvas keeps a transparent `outline` so Windows High Contrast Mode still shows focus." A bare `outline: none` is a P0 audit failure.
- **The focus color** resolves to `system.color.border.primary.default` (blue-500) / `brand.common.focusOutline`. To re-theme it, override `brand.common.focusOutline` (or `system.color.brand.focus.primary`) — don't hard-code a hue.
- **Error / caution inputs** add a critical/caution-colored inner ring (`system.color.border.critical.default` / `.caution.default`) plus the blue outer ring on focus. This comes from `FormField error="error" | "caution"` — you don't write it yourself.
- `useThemedRing('error' | 'alert' | 'success')` exists but is **deprecated** — prefer the `brand.common.focusOutline` CSS var. R4 §5.1: "Components already wire this; you rarely set focus styles yourself."

**DON'T** ever write `outline: none`, `:focus { box-shadow: none }`, or strip a component's focus styling via `cs`. **DO** let the component own its ring; when building a custom focusable control, reproduce the double box-shadow + transparent outline pattern above.

---

## 3. `AccessibleHide` — visually hidden, screen-reader available

R4 §5.3: `import {AccessibleHide, accessibleHide, accessibleHideStyles} from '@workday/canvas-kit-react/common'`. Use for visually-hidden labels — an actions-column header, a skip link, or extra context for an icon button. The `accessibleHide` style object (clip + 1px + absolute) can be spread into `cs`.

```tsx
import {AccessibleHide} from '@workday/canvas-kit-react/common';

// A visually-empty but named table header
<Table.Header scope="col">
  <AccessibleHide>Actions</AccessibleHide>
</Table.Header>
```

```tsx
// Spread the style object into another element's cs
import {accessibleHide} from '@workday/canvas-kit-react/common';

<span cs={accessibleHide}>Loading results</span>
```

**DON'T** use `display: none` or `visibility: hidden` for screen-reader-only text — both hide it from AT too. **DO** use `AccessibleHide` / the `accessibleHide` style.

### `AriaLiveRegion` — announce async changes

R4 §5.4: `import {AriaLiveRegion} from '@workday/canvas-kit-react/common'`. Props: `aria-live` (`'polite'` | `'assertive'` | `'off'`, default `polite`), `aria-atomic` (default `true`), `role` (`'status'` | `'alert'` | `'log'`, default `status`). Wrap dynamic status text — save confirmations, validation summaries, search-result counts.

```tsx
import {AriaLiveRegion} from '@workday/canvas-kit-react/common';

<AriaLiveRegion>{`${results.length} results`}</AriaLiveRegion>
```

### `useUniqueId` — stable, CSS-safe IDs

R4 §5.5: `import {useUniqueId} from '@workday/canvas-kit-react/common'`. Generates stable, CSS-safe, HTML5-valid ids (uses `React.useId()` when available; transforms `:r0:` → `«r0»` so ids are valid CSS selectors). Use it to link headings to regions (`aria-labelledby`), custom labels to inputs, etc.

```tsx
const headingId = useUniqueId();
<Heading id={headingId}>Workbooks</Heading>
<Table aria-labelledby={headingId}>…</Table>
```

**DON'T** generate ids with `Math.random()` (unstable across SSR/hydration) or hard-code them (collisions). `setUniqueSeed` / `resetUniqueIdCount` exist for SSR/test stability.

---

## 4. Per-component ARIA requirements

### Icon-only controls — always `aria-label`

R4 §5.9: Icon-only controls **must** have an `aria-label`. This includes `TertiaryButton icon={…}` with no text, `Modal.CloseIcon`, `Toast.CloseIcon`, and `SidePanel.ToggleButton` (the toggle supplies its own).

```tsx
<TertiaryButton icon={gearIcon} aria-label="Settings" />
<Modal.CloseIcon aria-label="Close" />
<Toast.CloseIcon aria-label="Close notification" />
```

### Breadcrumbs / Pagination — `aria-label` on the nav

Navigation landmarks that repeat on a page need a name to disambiguate. `Pagination` takes `aria-label` (e.g. `"Pagination"`); each step/page button takes its own `aria-label` (`"Previous"`, `"Next"`, `"Page 3"`), and the model exposes `aria-current` on the active page (R4 §5.8). A breadcrumb trail likewise needs `aria-label="Breadcrumbs"` on its nav element.

```tsx
<Pagination aria-label="Pagination" lastPage={lastPage} onPageChange={setPage}>
  <Pagination.Controls>
    <Pagination.StepToPreviousButton aria-label="Previous" />
    {/* …PageButton aria-label={`Page ${n}`}… */}
    <Pagination.StepToNextButton aria-label="Next" />
  </Pagination.Controls>
</Pagination>
```

### Forms — `FormField` does the wiring

R4 §5.2 / §4.2: `FormField` auto-associates label↔input↔hint via generated ids and exposes `aria-describedby`, `required`, and `aria-invalid` (via `error`). **DO** put every labeled input inside a `FormField` with a `FormField.Label`. **DON'T** use a bare `<TextInput>` for a labeled field, and don't manually set `aria-describedby` / `aria-invalid` — the model owns them.

### Tables — `scope` + `aria-labelledby`

R4 §4.3: Use `scope="col"` / `scope="row"` on `Table.Header`, and link the `Table` to its heading with `aria-labelledby`. A purely-visual column (row actions) still needs a name via `AccessibleHide`.

### Icons — decorative vs meaningful

R4 §5.9: `SystemIcon` (UI glyphs, `@workday/canvas-system-icons-web`), `AccentIcon` (decorative/illustrative, `@workday/canvas-accent-icons-web`), `Graphic` (large illustrations). Decorative icons are `aria-hidden`; give an `aria-label` **only** when the icon conveys meaning on its own (e.g. `StatusIndicator.Icon aria-label="published"`).

---

## 5. RTL / bidirectional support — logical properties

R4 §5.6: Direction is set by `CanvasProvider` via `<div dir={…}>` (from theme `canvas.direction`, default LTR). To go RTL, pass `theme={{canvas: {direction: ContentDirection.RTL}}}` to a `CanvasProvider`.

```tsx
import {CanvasProvider, ContentDirection} from '@workday/canvas-kit-react/common';

<CanvasProvider theme={{canvas: {direction: ContentDirection.RTL}}}>
  {/* mirrors automatically */}
</CanvasProvider>
```

**Always use CSS logical properties** so layouts mirror automatically (R4 §5.6): `marginInlineStart` / `marginInlineEnd`, `paddingInline`, `insetInlineStart` / `insetInlineEnd`, `marginBlockStart` / `marginBlockEnd`. Canvas examples use these everywhere (Table, SidePanel, FormField all use `*Inline*` / `*Block*`).

| Don't (physical, breaks RTL) | Do (logical, RTL-safe) |
|---|---|
| `marginLeft` / `marginRight` | `marginInlineStart` / `marginInlineEnd` |
| `paddingLeft` + `paddingRight` | `paddingInline` |
| `left` / `right` | `insetInlineStart` / `insetInlineEnd` |
| `marginTop` / `marginBottom` | `marginBlockStart` / `marginBlockEnd` |
| `borderLeft` | `borderInlineStart` |
| `text-align: left` | `text-align: start` |

Stencils use the `:dir(rtl)` selector for transforms (e.g. `SidePanelToggleButton` flips `scaleX` under `:dir(rtl)`). At runtime, `isElementRTL(element)` is the current detection util; `useIsRTL()` exists but is **deprecated**.

**DON'T** use physical `left`/`right`/`Top`/`Bottom` margins, padding, or insets in `cs` blocks. **DO** reach for the logical equivalent every time — it's the single biggest RTL win and costs nothing in LTR.

---

## 6. Color contrast guarantees

R4 §5.7: Tokens are designed to meet **WCAG AA**. Use **semantic** foreground tokens against their intended backgrounds:

- `fg.default` / `fg.strong` on `bg.default` / `bg.alt.*`
- `fg.inverse` on dark / primary surfaces (e.g. text on a `PrimaryButton`)
- status `fg.{success, critical, caution}.default` on white

Status indicators and themed rings pair an icon + text so meaning is **never color-only**. R4 §5.7: "Do **not** put `fg.muted.default` on colored surfaces or hand-pick palette hues — let the semantic tokens enforce contrast."

**DON'T** put `fg.muted.default` on a colored/branded surface, and don't pick raw `base.palette.*` hues for text. **DO** keep meaning conveyed by icon + label, not hue alone (red status still says "failed").

---

## 7. Keyboard navigation (built into the models)

All of the following is provided by the components — verify it works, don't build it (R4 §5.8):

- **Buttons / links:** native `<button>` / `<a>`; Enter/Space activate; real `:focus-visible` ring.
- **Menu:** Up/Down to move, Enter/Space to select, Esc to close, type-ahead jumps to items, focus returns to target.
- **Tabs:** Left/Right (or Up/Down) arrow roving, Home/End; only the active tab is in the tab order; overflowed tabs collapse into a menu.
- **Modal / Dialog:** focus is trapped inside; Tab cycles within; Esc closes; focus returns to the trigger.
- **Select / Combobox:** Up/Down/Home/End/type-ahead, Enter selects, Esc closes.
- **SidePanel toggle:** the **first focusable element** in the panel; toggling is a single button with `aria-pressed`.
- **Pagination:** Prev/Next buttons + numbered page buttons, each with `aria-label`; current page exposes `aria-current`.

**DO** keep `<SidePanel.ToggleButton />` first in the panel so keyboard users reach it before nav items. **DON'T** add `tabIndex` to non-interactive elements or remove it from interactive ones — the models manage the tab order (including roving tabindex) for you.

---

## Accessibility checklist (use before shipping any screen)

- [ ] Every interactive widget is a real Canvas compound (no hand-rolled `<div role="...">`).
- [ ] No `outline: none` and no overridden/stripped focus `box-shadow` anywhere.
- [ ] Custom focusable controls use `:focus-visible` + the double box-shadow + transparent outline.
- [ ] Every icon-only button has an `aria-label`; meaningful icons are labeled, decorative ones are `aria-hidden`.
- [ ] `Pagination` / breadcrumb navs have an `aria-label`; page buttons are labeled.
- [ ] Every labeled input is inside a `FormField` with a `FormField.Label`; errors use `error="error" | "caution"`.
- [ ] Tables use `scope` on headers and `aria-labelledby` linking to the heading; visual-only columns use `AccessibleHide`.
- [ ] IDs for `aria-labelledby` / `aria-describedby` come from `useUniqueId`.
- [ ] Async status changes are announced via `AriaLiveRegion` (or a Toast's built-in live region).
- [ ] All spacing/positioning in `cs` uses **logical** properties (`*Inline*` / `*Block*`), never physical.
- [ ] Color meaning is reinforced by text/icon; foreground uses semantic `fg.*` tokens against intended backgrounds.

See [patterns.md](./patterns.md) for the composition archetypes these guarantees live inside, and [tokens.md](./tokens.md) for the semantic token tables referenced above.
