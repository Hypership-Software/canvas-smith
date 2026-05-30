# Canvas Kit Component Catalog (v15)

The complete, builder-focused reference for every Canvas Kit component Canvasmith generates. For each component: **import path**, one-line **purpose**, the **compound / sub-component API**, **key props & variants** (with enums), and a **minimal correct snippet**.

**Pinned versions** — install exactly these:
```
@workday/canvas-kit-react@15.0.6
@workday/canvas-kit-preview-react@15.0.6
@workday/canvas-kit-styling@15.0.6
@workday/canvas-tokens-web@4.3.0
@workday/canvas-system-icons-web@4.0.4
@workday/canvas-kit-react-fonts
@emotion/react@^11.7  @emotion/styled@^11.6  react@^18
```

Imports are per-module subpaths: `@workday/canvas-kit-react/<module>`, preview from `@workday/canvas-kit-preview-react/<module>`, tokens from `@workday/canvas-tokens-web`, icons from `@workday/canvas-system-icons-web`, styling helpers from `@workday/canvas-kit-styling`.

---

## CRITICAL GOTCHAS — read these first

1. **`FormField` WRAPS every input** via `FormField.Input as={...}`:
   ```tsx
   <FormField>
     <FormField.Label>Email</FormField.Label>
     <FormField.Input as={TextInput} />
   </FormField>
   ```
   This is what gives you label↔input↔hint `id` association, `aria-describedby`, `required`/`aria-invalid` for free. A non-Canvas input passed to `as=` will NOT get error/validation styling — you handle that yourself.

2. **`Select` WRAPS `FormField` (inverted nesting).** Every other input nests inside FormField — but Select is the exception: `Select` is the OUTER element and `FormField.Input as={Select.Input}` goes inside it, inside a `FormField.Field`:
   ```tsx
   <FormField>
     <FormField.Label>Contact</FormField.Label>
     <FormField.Field>
       <Select items={options}>
         <FormField.Input as={Select.Input} />
         <Select.Popper><Select.Card>
           <Select.List>{item => <Select.Item>{item}</Select.Item>}</Select.List>
         </Select.Card></Select.Popper>
       </Select>
     </FormField.Field>
   </FormField>
   ```

3. **`Popup` ships NO default behaviors.** Unlike `Modal`/`Dialog`, a raw `Popup` does nothing on its own — you MUST opt in with hooks: `useCloseOnOutsideClick(model)`, `useCloseOnEscape(model)`, `useInitialFocus(model)`, `useReturnFocus(model)`. Forgetting these = a popup that traps the user. `Modal` and `Dialog` wire these automatically.

4. **These v15 main components are DEPRECATED → use `@workday/canvas-kit-preview-react` instead:**
   - `Switch` → `@workday/canvas-kit-preview-react/switch`
   - `StatusIndicator` → `@workday/canvas-kit-preview-react/status-indicator`
   - the **class-based** `RadioGroup` → the compound `RadioGroup` in `@workday/canvas-kit-react/radio` (or `@workday/canvas-kit-preview-react/radio`)
   - `AccentIcon` (deprecated in v15; still shipped from `@workday/canvas-kit-react/icon` for empty-state graphics)

5. **`aria-label` is mandatory** on: every icon-only button (`TertiaryButton icon=…`), all `*.CloseIcon`, `Pill.Icon`, overflow buttons, and on the **container** of `Breadcrumbs` and `Pagination`. Collection items wire selection/panels via **`data-id`**.

6. **Theming = CSS token imports + `CanvasProvider`**, never a JS theme object. Import the four `_variables.css` files at app root (see reference/setup.md) or nothing renders Workday-correctly. The `cs` prop is your styling escape hatch on every component.

---

## How every Canvas component is built (the patterns behind the API)

- **Simple components** = `createComponent('element')(...)`. They forward `ref` and accept **`as`** to change the rendered tag (`<Box as="p">`, `<Modal.Target as={PrimaryButton}>`).
- **Compound components** = `createContainer('element')({modelHook, subComponents})(...)`. They build a **model** (`{state, events}`) shared via React context. Use either inline (`<Tabs onSelect={...}>`) or with a hoisted model (`const model = useTabsModel(); <Tabs model={model}>`).
- **Sub-components** are dot properties: `Tabs.List`, `FormField.Label`, `Menu.Item`.
- **Collection components** (Menu, Select, Tabs, ActionBar, Breadcrumbs, Pagination) take an `items` array + a **render-prop child**: `{(item) => <Menu.Item data-id={item.id}>{item.text}</Menu.Item>}`.
- **`cs` prop** on every component takes `system.*` tokens, a `createStyles` className, a stencil result, or an array — prefer it over inline `style`.

### Shared types
- `ButtonSizes = 'extraSmall' | 'small' | 'medium' | 'large'` (default `'medium'`).
- `ErrorType` (from `/common`): inputs accept `error={ErrorType.Error}` / `ErrorType.Caution`, or the string `'error'` / `'caution'`.
- `GrowthBehavior` → the `grow` boolean (width 100%).
- Layout primitives (`Box`/`Flex`/`Grid`) expose full **style props** (space, color, layout, flex, grid, border, position, depth, text).

---

# 1 — Buttons & Actions
Import root: `@workday/canvas-kit-react/button`

All buttons share `ButtonProps`: `size?: ButtonSizes`, `icon?: CanvasSystemIcon` (from `@workday/canvas-system-icons-web`), `iconPosition?: 'start' | 'end'` (default `'start'`; auto-becomes icon-only when `icon` given with no children), `grow?: boolean`, `colors?: ButtonColors` (override per-state `default/hover/active/focus/disabled` colors), `shouldMirrorIcon?`, plus `cs` and native `<button>` attrs. Buttons render as fully-rounded **pills**.

| Component | Import | Purpose | Distinct props / variants |
|---|---|---|---|
| `PrimaryButton` | `/button` | Highest-emphasis CTA (filled brand blue). | `variant?: 'inverse'` |
| `SecondaryButton` | `/button` | Medium emphasis (outlined). | `variant?: 'inverse'` |
| `TertiaryButton` | `/button` | Lowest emphasis / text & icon button. | `variant?: 'inverse'`; icon-only when `icon` + no children |
| `DeleteButton` | `/button` | Destructive action (red filled). | — |
| `Hyperlink` | `/button` | Styled anchor `<a>`. | native anchor props (`href`) |
| `ExternalHyperlink` | `/button` | Anchor with external-link icon, opens new tab. | `iconLabel` (a11y) |
| `ToolbarIconButton` | `/button` | Icon-only toolbar button, toggleable. | `toggled?`, `onToggleChange`, `icon` (required) |
| `ToolbarDropdownButton` | `/button` | Toolbar button with chevron-down for menus. | `icon?` (renders children if absent) |
| `BaseButton` | `/button` | Unstyled base for custom buttons. | exposes `BaseButton.Icon`, `BaseButton.Label`; `buttonStencil`, `buttonColorPropVars` exported |

```tsx
import {PrimaryButton, SecondaryButton, TertiaryButton, DeleteButton} from '@workday/canvas-kit-react/button';
import {plusIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';

<PrimaryButton size="medium" icon={plusIcon} iconPosition="start" onClick={save}>Add</PrimaryButton>
<SecondaryButton variant="inverse">Cancel</SecondaryButton>
<TertiaryButton icon={plusIcon} aria-label="Add" />   {/* icon-only → aria-label required */}
<DeleteButton grow>Delete</DeleteButton>
```
Per-state color override:
```tsx
<PrimaryButton colors={{
  default: {background: system.color.bg.primary.default, label: system.color.fg.inverse},
  hover:   {background: system.color.bg.primary.strong},
}}>Custom</PrimaryButton>
```

---

# 2 — Inputs & Forms

## FormField — `@workday/canvas-kit-react/form-field`
**Purpose:** accessible wrapper linking a label, input, and hint by generated `id`. `createContainer('div')`, model `useFormFieldModel`.
**Props:** `orientation?: 'vertical' | 'horizontalStart' | 'horizontalEnd'` (default `'vertical'`), `grow?`, `error?: ErrorType`, `isRequired?` / `required?`, `id?`.
**Sub-components:** `FormField.Label` (`<label>`), `FormField.Input` (render the real input via `as=`), `FormField.Hint` (help/error text wired to `aria-describedby`), `FormField.Field` (alignment wrapper for Input+Hint — use for horizontal orientation and for Select).
The stencil already adds bottom margin between fields and a label↔field gap — you usually do NOT add manual spacing between FormFields.
```tsx
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';

<FormField orientation="vertical" required error="error">
  <FormField.Label>First name</FormField.Label>
  <FormField.Field>
    <FormField.Input as={TextInput} value={v} onChange={e => set(e.target.value)} />
    <FormField.Hint>This field is required.</FormField.Hint>
  </FormField.Field>
</FormField>
```
Also exports **`FormFieldGroup`** (+ `FormFieldGroup.Label` / `.List` / `.Input`) for grouped inputs like radio/checkbox sets.

## TextInput — `@workday/canvas-kit-react/text-input`
**Purpose:** single-line text input. `createComponent('input')`.
**Props:** `error?: ErrorType`, `width?: number | string`, `grow?`, all native input attrs (`type`, `placeholder`, `value`, `onChange`). Also exports **`InputGroup`** to compose icons/buttons inside the field.
```tsx
<FormField>
  <FormField.Label>Email</FormField.Label>
  <FormField.Input as={TextInput} type="email" placeholder="you@acme.com" />
</FormField>
```

## TextArea — `@workday/canvas-kit-react/text-area`
**Purpose:** multi-line input. `createComponent('textarea')`, extends `textInputStencil`.
**Props:** `error?: ErrorType`, `resize?: 'none' | 'both' | 'horizontal' | 'vertical'` (default `'both'`; also `TextArea.ResizeDirection`), `grow?`, native `rows`.
```tsx
<FormField.Input as={TextArea} resize="vertical" rows={4} />
```

## Select — `@workday/canvas-kit-react/select`
**Purpose:** combobox-backed single select. **`Select` WRAPS `FormField` (inverted nesting — see Gotcha 2).** Model `useSelectModel`. Accepts `items`.
**Sub-components:** `Select.Input` (`role=combobox`), `Select.Popper`, `Select.Card`, `Select.List` (render-prop over `items`), `Select.Item` (+ `Select.Item.Icon`).
```tsx
import {Select} from '@workday/canvas-kit-react/select';
const options = ['E-mail', 'Phone', 'Fax'];

<FormField>
  <FormField.Label>Contact</FormField.Label>
  <FormField.Field>
    <Select items={options}>
      <FormField.Input as={Select.Input} onChange={e => set(e.target.value)} />
      <Select.Popper>
        <Select.Card>
          <Select.List>{item => <Select.Item>{item}</Select.Item>}</Select.List>
        </Select.Card>
      </Select.Popper>
    </Select>
  </FormField.Field>
</FormField>
```

## Combobox — `@workday/canvas-kit-react/combobox`
**Purpose:** lower-level base for Select/autocomplete. Model `useComboboxModel`.
**Sub-components:** `Combobox.Input`, `Combobox.Menu` (with `.Popper`/`.Card`/`.List`/`.Item`). **Hooks:** `useComboboxLoader`, `useComboboxInputConstrained` (select-like), `useComboboxInputArbitrary` (free text). Prefer `Select` or preview `MultiSelect` for standard cases.

## Checkbox — `@workday/canvas-kit-react/checkbox`
**Purpose:** boolean toggle. `createComponent('input')`.
**Props:** `checked?`, `disabled?`, `indeterminate?`, `label?: string`, `id?`, `value?`, `error?: ErrorType`, `variant?: 'inverse'`, `onChange`.
```tsx
import {Checkbox} from '@workday/canvas-kit-react/checkbox';
<Checkbox checked={c} label="I agree" onChange={e => setC(e.target.checked)} />
```

## Radio — `@workday/canvas-kit-react/radio`
**Purpose:** single-choice group. **Preferred:** the compound `RadioGroup` (model `useRadioModel`). **The class-based `RadioGroup` is DEPRECATED — do not use it (see Gotcha 4).**
**Sub-components:** `RadioGroup.RadioButton` (renders input+label, takes `value`); `RadioGroup.Label` → `RadioGroup.Label.Input` / `RadioGroup.Label.Text` for custom layouts.
**Props:** `name?`, `value`, `error?: ErrorType`, `onChange`.
```tsx
import {RadioGroup} from '@workday/canvas-kit-react/radio';
<RadioGroup name="crust" value={val} onChange={setVal}>
  <RadioGroup.RadioButton value="thin">Thin</RadioGroup.RadioButton>
  <RadioGroup.RadioButton value="deep">Deep dish</RadioGroup.RadioButton>
</RadioGroup>
```
A newer `RadioGroup`/`useRadioModel` also lives in `@workday/canvas-kit-preview-react/radio`.

## Switch — `@workday/canvas-kit-preview-react/switch`
**Purpose:** on/off toggle. **The main `@workday/canvas-kit-react/switch` is DEPRECATED — use the preview compound (see Gotcha 4).**
**Sub-components (preview):** `Switch.Input`, `Switch.Background`, `Switch.Circle`, `Switch.Icon`, `Switch.Container`.
**Props:** `checked?`, `disabled?`, `id?`, `value?`, `error?: ErrorType`, `onChange`. Renders `<input role="switch" type="checkbox">`.
```tsx
import {Switch} from '@workday/canvas-kit-preview-react/switch';
<Switch checked={on} onChange={e => setOn(e.target.checked)} />
```

## SegmentedControl — `@workday/canvas-kit-react/segmented-control`
**Purpose:** single-select button group (e.g. view switcher). Model `useSegmentedControlModel` (accepts `items`, `value`, `onSelect`).
**Sub-components:** `SegmentedControl.List` (renders a `Grid`; takes `aria-label`), `SegmentedControl.Item` (a `BaseButton`; uses `data-id`, supports `icon`).
```tsx
import {SegmentedControl} from '@workday/canvas-kit-react/segmented-control';
import {tableIcon, gridIcon} from '@workday/canvas-system-icons-web';

<SegmentedControl onSelect={d => setView(d.id)}>
  <SegmentedControl.List aria-label="View">
    <SegmentedControl.Item data-id="table" icon={tableIcon} aria-label="Table" />
    <SegmentedControl.Item data-id="grid"  icon={gridIcon}  aria-label="Grid" />
  </SegmentedControl.List>
</SegmentedControl>
```

## ColorPicker — `@workday/canvas-kit-react/color-picker` (newer: `@workday/canvas-kit-preview-react/color-picker`)
**Purpose:** swatch grid + custom hex input. Exports `ColorPicker`, `ColorInput`, `ColorPreview`, `Swatch`, `SwatchBook`.
**Props:** `value`, `colorSet`, `onColorChange`, `showCustomHexInput`. Prefer the preview version for new work.

## MultiSelect — `@workday/canvas-kit-preview-react/multi-select` (preview only)
**Purpose:** multi-value combobox with removable selection pills. Model `useMultiSelectModel`.
**Sub-components:** `MultiSelect.Input`, `MultiSelect.Popper`, `MultiSelect.Card`, `MultiSelect.List`, `MultiSelect.Item` (mirrors Select).

---

# 3 — Containers & Layout

## Box / Flex / Grid — `@workday/canvas-kit-react/layout`
**Purpose:** the token-aware layout primitives underpinning nearly everything.
- **`Box`** — `createComponent('div')`. Accepts the full **style-prop** set (space `margin`/`padding`/`marginX`…, color `backgroundColor`/`color`, layout `display`/`width`/`height`/`overflow`, border, position, depth, text) plus `cs` and `as`.
- **`Flex`** — `Box` + `display:flex`: `flexDirection`, `gap`, `alignItems`, `justifyContent`, `flexWrap`, `columnGap`, `rowGap`. Sub-component `Flex.Item`.
- **`Grid`** — `Box` + `display:grid`: `gridTemplateColumns`, `gridTemplateAreas`, `gridGap`, `gridAutoFlow`, `gridArea`. Sub-component `Grid.Item` (`gridArea`, `gridColumn`, `gridRowStart`).

> The old style-prop shorthands (`padding="m"`, `space="m"`) are **deprecated in v15** — pass `system.*` tokens via `cs` or explicit props. Use **logical properties** (`marginBlockStart`, `paddingInline`) for RTL safety.
```tsx
import {Box, Flex, Grid} from '@workday/canvas-kit-react/layout';
import {system} from '@workday/canvas-tokens-web';

<Flex gap={system.space.x4} alignItems="center" padding={system.space.x6}>…</Flex>
<Grid gridTemplateColumns="1fr 1fr" gridGap={system.space.x4}>…</Grid>
```
Also exports `mergeStyles` and the `*StyleProps` types.

## Card — `@workday/canvas-kit-react/card`
**Purpose:** elevated content container. `createComponent('div')`.
**Props:** `variant?: 'borderless' | 'tonal'` (default has a border). **Sub-components:** `Card.Heading` (default `<h3>`), `Card.Body`. To use as a dialog add `role` + `aria-labelledby`.
```tsx
import {Card} from '@workday/canvas-kit-react/card';
<Card variant="tonal">
  <Card.Heading>Title</Card.Heading>
  <Card.Body>Body content</Card.Body>
</Card>
```

## Expandable — `@workday/canvas-kit-react/expandable`
**Purpose:** disclosure with heading/avatar/chevron. Model `useExpandableModel`.
**Sub-components:** `Expandable.Target` (heading+button; sets `aria-expanded`/`aria-controls`), `Expandable.Title`, `Expandable.Icon` (`iconPosition` chooses chevron side), `Expandable.Avatar`, `Expandable.Content`.
```tsx
import {Expandable} from '@workday/canvas-kit-react/expandable';
<Expandable>
  <Expandable.Target><Expandable.Icon /><Expandable.Title>Details</Expandable.Title></Expandable.Target>
  <Expandable.Content>Hidden content</Expandable.Content>
</Expandable>
```

## Disclosure — `@workday/canvas-kit-react/disclosure`
**Purpose:** headless show/hide primitive (no visual of its own). Exports `useDisclosureModel` (config `id`, `initialVisibility: 'hidden' | 'visible'`; state `visibility`; events `show()` / `hide()` / `toggle()`). Powers Expandable/Popup/SidePanel.

## SidePanel — `@workday/canvas-kit-react/side-panel`
**Purpose:** collapsible nav/filter rail. `createContainer('section')`, model `useSidePanelModel`.
**Props:** `variant?: 'standard' | 'alternate'` (default `'standard'` = slate nav bg; `'alternate'` = white + depth-3), `collapsedWidth?` (default 64), `expandedWidth?` (default 320), `origin?: 'start' | 'end'`.
**Sub-components:** `SidePanel.ToggleButton` (must be the first focusable element; auto-wires `aria-controls`/`aria-pressed`/`aria-labelledby`), `SidePanel.Heading` (provides accessible name; hidden when collapsed).
```tsx
import {SidePanel, useSidePanelModel} from '@workday/canvas-kit-react/side-panel';
const model = useSidePanelModel({initialTransitionState: 'expanded'});
<SidePanel model={model} variant="alternate">
  <SidePanel.ToggleButton />
  <SidePanel.Heading>Filters</SidePanel.Heading>
</SidePanel>
```

## Tabs — `@workday/canvas-kit-react/tabs`
**Purpose:** tabbed panel switcher with overflow-into-menu. `createContainer` (renders no element), model `useTabsModel` (built on Menu for overflow).
**Props:** `onSelect(data)`, `items?` (dynamic), `initialTab`.
**Sub-components:** `Tabs.List` (`role=tablist`, optional `overflowButton`), `Tabs.Item` (`role=tab`, `data-id` matches its panel), `Tabs.Panel` (`role=tabpanel`, `data-id`), `Tabs.Panels` (render-prop for dynamic), `Tabs.OverflowButton`, `Tabs.Menu` (`.Popper`/`.Card`/`.List`/`.Item`). Handles roving tabindex + `aria-selected`/`aria-controls` automatically.
```tsx
import {Tabs} from '@workday/canvas-kit-react/tabs';
<Tabs onSelect={d => console.log(d.id)}>
  <Tabs.List>
    <Tabs.Item data-id="first">First</Tabs.Item>
    <Tabs.Item data-id="second">Second</Tabs.Item>
  </Tabs.List>
  <Tabs.Panel data-id="first">First content</Tabs.Panel>
  <Tabs.Panel data-id="second">Second content</Tabs.Panel>
</Tabs>
```

---

# 4 — Navigation

## ActionBar — `@workday/canvas-kit-react/action-bar`
**Purpose:** sticky bar of primary/secondary actions with overflow. Model `useActionBarModel` (accepts `items`); built on Menu.
**Sub-components:** `ActionBar.List` (Flex; optional `overflowButton`), `ActionBar.Item` (default `SecondaryButton` — override with `as={PrimaryButton}`), `ActionBar.OverflowButton`, `ActionBar.Menu` (`.Popper`/`.Card`/`.List`/`.Item`).
```tsx
import {ActionBar} from '@workday/canvas-kit-react/action-bar';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
<ActionBar>
  <ActionBar.List>
    <ActionBar.Item as={PrimaryButton} onClick={save}>Save</ActionBar.Item>
    <ActionBar.Item onClick={cancel}>Cancel</ActionBar.Item>
  </ActionBar.List>
</ActionBar>
```

## Breadcrumbs — `@workday/canvas-kit-react/breadcrumbs`
**Purpose:** hierarchical path nav with overflow. `createContainer('nav')`, model `useBreadcrumbsModel`. **Requires `aria-label` on the container.** Built on Menu.
**Sub-components:** `Breadcrumbs.List` (`<ul>`, optional `overflowButton`/`overflowButtonProps`), `Breadcrumbs.Item` (`<li>`, `maxWidth` default 350px truncation+tooltip), `Breadcrumbs.Link` (`<a>`, auto tooltip on truncate), `Breadcrumbs.CurrentItem` (last item), `Breadcrumbs.OverflowButton`, `Breadcrumbs.Menu`.
```tsx
import {Breadcrumbs} from '@workday/canvas-kit-react/breadcrumbs';
<Breadcrumbs aria-label="Breadcrumbs">
  <Breadcrumbs.List>
    <Breadcrumbs.Item><Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link></Breadcrumbs.Item>
    <Breadcrumbs.CurrentItem>Breadcrumbs</Breadcrumbs.CurrentItem>
  </Breadcrumbs.List>
</Breadcrumbs>
```

## Menu — `@workday/canvas-kit-react/menu`
**Purpose:** popup action/selection list (popup + list). Model `useMenuModel`. Modes: `single` (select closes) / `multiple` (toggles, stays open). Roving tabindex + type-ahead.
**Sub-components:** `Menu.Target` (default `SecondaryButton`; sets `aria-haspopup`/`aria-expanded`), `Menu.TargetContext` (right-click trigger), `Menu.Popper`, `Menu.Card`, `Menu.List` (render-prop + `items`), `Menu.Item` (`data-id`; add `data-text` for complex children) with `Menu.Item.Icon` / `Menu.Item.Text`, `Menu.Option` (`role=option`, selectable check — used by Select/Combobox), `Menu.Group`, `Menu.Divider`, `Menu.Submenu`.
```tsx
import {Menu} from '@workday/canvas-kit-react/menu';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {relatedActionsIcon, editIcon, trashIcon} from '@workday/canvas-system-icons-web';

<Menu onSelect={d => console.log(d.id)}>
  <Menu.Target as={TertiaryButton} icon={relatedActionsIcon} aria-label="Row actions" />
  <Menu.Popper><Menu.Card><Menu.List>
    <Menu.Item data-id="edit"><Menu.Item.Icon icon={editIcon} /><Menu.Item.Text>Edit</Menu.Item.Text></Menu.Item>
    <Menu.Divider />
    <Menu.Item data-id="delete"><Menu.Item.Icon icon={trashIcon} /><Menu.Item.Text>Delete</Menu.Item.Text></Menu.Item>
  </Menu.List></Menu.Card></Menu.Popper>
</Menu>
```

## Pagination — `@workday/canvas-kit-react/pagination` (also a Data component)
**Purpose:** paged-result navigation. `createComponent('nav')`, model `usePaginationModel`. **Requires `aria-label` on the container.**
**Config props:** `lastPage`, `firstPage`, `initialCurrentPage`, `rangeSize`, `onPageChange(pageNumber)`.
**Sub-components:** `Pagination.Controls`, `Pagination.JumpToFirstButton`, `Pagination.StepToPreviousButton`, `Pagination.StepToNextButton`, `Pagination.JumpToLastButton` (each needs `aria-label`), `Pagination.PageList` (render-prop over `state.range`), `Pagination.PageListItem`, `Pagination.PageButton` (`pageNumber`, `aria-label`), `Pagination.GoToForm`/`GoToTextInput`/`GoToLabel`, `Pagination.AdditionalDetails` (aria-live results count).
**Exported helpers:** `getLastPage`, `getVisibleResultsMin`, `getVisibleResultsMax`.
```tsx
import {Pagination} from '@workday/canvas-kit-react/pagination';
<Pagination aria-label="Pagination" lastPage={100} initialCurrentPage={6} rangeSize={3}
            onPageChange={n => console.log(n)}>
  <Pagination.Controls>
    <Pagination.StepToPreviousButton aria-label="Previous" />
    <Pagination.PageList>
      {({state}) => state.range.map(n => (
        <Pagination.PageListItem key={n}>
          <Pagination.PageButton aria-label={`Page ${n}`} pageNumber={n} />
        </Pagination.PageListItem>))}
    </Pagination.PageList>
    <Pagination.StepToNextButton aria-label="Next" />
  </Pagination.Controls>
  <Pagination.AdditionalDetails>
    {({state}) => `Page ${state.currentPage} of ${state.lastPage}`}
  </Pagination.AdditionalDetails>
</Pagination>
```

---

# 5 — Feedback & Status

## Banner — `@workday/canvas-kit-react/banner`
**Purpose:** persistent inline/page-level message with an action. `createContainer('button')`, model `useBannerModel`.
**Props:** `hasError?: boolean` (true=critical/red, false=caution/yellow), `isSticky?: boolean` (collapses to icon+count, hides ActionText), `onClick`, `id`.
**Sub-components:** `Banner.Icon` (auto exclamation glyph), `Banner.Label`, `Banner.ActionText`.
```tsx
import {Banner} from '@workday/canvas-kit-react/banner';
<Banner hasError onClick={view}>
  <Banner.Icon /><Banner.Label>3 Errors</Banner.Label><Banner.ActionText>View All</Banner.ActionText>
</Banner>
```

## Toast — `@workday/canvas-kit-react/toast`
**Purpose:** transient floating notification. `createContainer('div')` wrapping `Popup.Card`, model `useToastModel`.
**Props:** `mode?: 'dialog' | 'alert' | 'status'` (sets aria roles; `'dialog'` needs `aria-label`).
**Sub-components:** `Toast.Icon` (`icon` + `color`), `Toast.Body`, `Toast.Message`, `Toast.Link`, `Toast.CloseIcon` (`aria-label`, `onClick`). Render inside a `Popper`/portal for floating placement.
```tsx
import {Toast} from '@workday/canvas-kit-react/toast';
import {checkIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';
<Toast mode="status">
  <Toast.Icon icon={checkIcon} color={system.color.fg.positive.default} />
  <Toast.Body><Toast.Message>Saved successfully.</Toast.Message></Toast.Body>
  <Toast.CloseIcon aria-label="Close" onClick={close} />
</Toast>
```

## StatusIndicator — `@workday/canvas-kit-preview-react/status-indicator`
**Purpose:** compact status pill. **The main `@workday/canvas-kit-react/status-indicator` is DEPRECATED — use the preview compound (see Gotcha 4).**
**Props:** `variant?: 'info' | 'positive' | 'caution' | 'critical' | 'neutral' | 'transparent'` (default `'neutral'`; legacy aliases blue/green/orange/red/gray map onto these), `emphasis?: 'low' | 'high'` (default `'low'`; `'high'` deprecated). Max width 200px (truncates).
**Sub-components:** `StatusIndicator.Label`, `StatusIndicator.Icon` (`icon` prop).
```tsx
import {StatusIndicator} from '@workday/canvas-kit-preview-react/status-indicator';
import {uploadCloudIcon} from '@workday/canvas-system-icons-web';
<StatusIndicator variant="positive">
  <StatusIndicator.Icon icon={uploadCloudIcon} /><StatusIndicator.Label>Active</StatusIndicator.Label>
</StatusIndicator>
```

## LoadingDots — `@workday/canvas-kit-react/loading-dots`
**Purpose:** three-dot inline loading animation. `createComponent`.
**Props:** `loadingDotColor?: string` (default `system.color.accent.muted.default`), `cs`. Decorative — add visually-hidden text if it conveys state.
```tsx
import {LoadingDots} from '@workday/canvas-kit-react/loading-dots';
<LoadingDots />
```
(Preview also ships `@workday/canvas-kit-preview-react/loading-sparkles` for an AI/loading sparkle animation.)

## Skeleton — `@workday/canvas-kit-react/skeleton`
**Purpose:** loading placeholder. `createComponent('div')`. Container has `aria-label` (default `'Loading'`) announced via visually-hidden text; children are `aria-hidden`.
**Sub-components:** `Skeleton.Header`, `Skeleton.Text` (`lineCount`; shrinks last line to 60%), `Skeleton.Shape` (`height`/`width`/`borderRadius` for circles/rects).
```tsx
import {Skeleton} from '@workday/canvas-kit-react/skeleton';
<Skeleton aria-label="Loading content">
  <Skeleton.Shape width={48} height={48} borderRadius={9999} />
  <Skeleton.Header /><Skeleton.Text lineCount={3} />
</Skeleton>
```

## InformationHighlight — `@workday/canvas-kit-react/information-highlight`
**Purpose:** highlighted callout box (info/caution/critical). `createContainer('section')`, model `useInformationHighlightModel`.
**Props:** `variant: 'informational' | 'caution' | 'critical'`, `emphasis: 'low' | 'high'`.
**Sub-components:** `InformationHighlight.Icon`, `InformationHighlight.Heading`, `InformationHighlight.Body`, `InformationHighlight.Link`.
```tsx
import {InformationHighlight} from '@workday/canvas-kit-react/information-highlight';
<InformationHighlight variant="informational" emphasis="low">
  <InformationHighlight.Icon />
  <InformationHighlight.Heading>Heads up</InformationHighlight.Heading>
  <InformationHighlight.Body>Some helpful context here.</InformationHighlight.Body>
  <InformationHighlight.Link href="#">Learn more</InformationHighlight.Link>
</InformationHighlight>
```

## CountBadge — `@workday/canvas-kit-react/badge`
**Purpose:** numeric count badge (notifications). `createComponent('span')` — the only export.
**Props:** `count?: number` (default 0), `limit?: number` (default 1000 → shows `999+`), `emphasis?: 'high' | 'low'` (default `'high'`), `variant?: 'inverse'`.
```tsx
import {CountBadge} from '@workday/canvas-kit-react/badge';
<CountBadge count={42} />
<CountBadge count={1200} limit={100} variant="inverse" />  {/* shows 99+ */}
```

## Pill — `@workday/canvas-kit-react/pill`
**Purpose:** compact token/tag (filter chips, people). `createContainer('button')`, model `usePillModel`.
**Props:** `variant?: 'readOnly' | 'removable'` (default = interactive `<button>`; `'readOnly'` → non-interactive `<span>`; `'removable'` → `<span>` with an icon-button focus target), `maxWidth?` (default 200, truncates + tooltip), `disabled?`.
**Sub-components:** `Pill.Avatar`, `Pill.Icon` (decorative; `aria-label`), `Pill.Label` (auto overflow tooltip), `Pill.Count`, `Pill.IconButton` (for `removable`; `aria-label` + `onClick`).
```tsx
import {Pill} from '@workday/canvas-kit-react/pill';
<Pill onClick={click}><Pill.Avatar /> <Pill.Label>Regina Skeltor</Pill.Label></Pill>
<Pill variant="removable">
  <Pill.Label>Shoes</Pill.Label>
  <Pill.IconButton aria-label="Remove" onClick={remove} />
</Pill>
<Pill variant="readOnly">Read only</Pill>
```

---

# 6 — Overlays
Shared model **`usePopupModel`** + popup behavior hooks. Modal/Dialog/Toast/Tooltip are all popup compositions; overlays portal to `document.body` via the PopupStack.

## Popup — `@workday/canvas-kit-react/popup`
**Purpose:** headless floating container. Model `usePopupModel`. **No default behaviors — you MUST opt in with hooks (see Gotcha 3):** `useCloseOnOutsideClick`, `useCloseOnEscape`, `useInitialFocus`, `useReturnFocus`, plus optional `useFocusRedirect`, `useCloseOnTargetHidden`, `useDisableBodyScroll`, `useAlwaysCloseOnOutsideClick`.
**Sub-components:** `Popup.Target` (default `SecondaryButton`), `Popup.Popper` (`placement`, `fallbackPlacements`; portals), `Popup.Card`, `Popup.Heading`, `Popup.Body`, `Popup.CloseIcon` (`aria-label`), `Popup.CloseButton`. Also `Popper` (raw, takes `open`/`anchorElement`), `getTransformFromPlacement`.
```tsx
import {Popup, usePopupModel, useCloseOnOutsideClick, useCloseOnEscape,
        useInitialFocus, useReturnFocus} from '@workday/canvas-kit-react/popup';
import {DeleteButton} from '@workday/canvas-kit-react/button';

const model = usePopupModel();
useCloseOnOutsideClick(model); useCloseOnEscape(model);
useInitialFocus(model);       useReturnFocus(model);

<Popup model={model}>
  <Popup.Target as={DeleteButton}>Delete Item</Popup.Target>
  <Popup.Popper placement="top">
    <Popup.Card>
      <Popup.CloseIcon aria-label="Close" />
      <Popup.Heading>Delete Item</Popup.Heading>
      <Popup.Body>Are you sure?</Popup.Body>
      <Popup.CloseButton as={DeleteButton} onClick={handleDelete}>Delete</Popup.CloseButton>
      <Popup.CloseButton>Cancel</Popup.CloseButton>
    </Popup.Card>
  </Popup.Popper>
</Popup>
```

## Modal — `@workday/canvas-kit-react/modal`
**Purpose:** focus-trapping overlay for required decisions (scrim covers the page). `createContainer` over Dialog/Popup, model `useModalModel`. Auto-handles focus trap + overlay + `aria-modal`; closes on outside click/escape by default.
**Sub-components:** `Modal.Target` (default `SecondaryButton`), `Modal.Overlay` (the dimmer — required wrapper), `Modal.OverflowOverlay` (scrolls the whole overlay for tall content), `Modal.Card`, `Modal.Heading` (labels via `aria-labelledby`; otherwise add `aria-label` to `Modal.Card`), `Modal.Body`, `Modal.CloseIcon` (`aria-label`), `Modal.CloseButton`.
```tsx
import {Modal} from '@workday/canvas-kit-react/modal';
import {PrimaryButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {Flex} from '@workday/canvas-kit-react/layout';
import {system} from '@workday/canvas-tokens-web';
<Modal>
  <Modal.Target as={PrimaryButton}>Open</Modal.Target>
  <Modal.Overlay>
    <Modal.Card>
      <Modal.CloseIcon aria-label="Close" />
      <Modal.Heading>Title</Modal.Heading>
      <Modal.Body>Body text</Modal.Body>
      <Flex cs={{gap: system.space.x4, paddingBlock: system.space.x2}}>
        <Modal.CloseButton as={PrimaryButton} onClick={onAccept}>OK</Modal.CloseButton>
        <Modal.CloseButton as={SecondaryButton}>Cancel</Modal.CloseButton>
      </Flex>
    </Modal.Card>
  </Modal.Overlay>
</Modal>
```
For a form-in-modal: render `Modal.Card as="form" onSubmit={...}` with a `PrimaryButton type="submit"` and call `model.events.hide()` on success.

## Dialog — `@workday/canvas-kit-react/dialog`
**Purpose:** non-modal popup-with-arrow alternative to Modal (no overlay/scrim, lighter weight). Model `useDialogModel`.
**Sub-components:** `Dialog.Target` (default `SecondaryButton`), `Dialog.Popper`, `Dialog.Card` (`role=dialog`, auto `aria-labelledby`), `Dialog.Heading`, `Dialog.Body`, `Dialog.CloseIcon` (`aria-label`), `Dialog.CloseButton`.
```tsx
import {Dialog} from '@workday/canvas-kit-react/dialog';
<Dialog>
  <Dialog.Target>Show</Dialog.Target>
  <Dialog.Popper><Dialog.Card>
    <Dialog.CloseIcon aria-label="Close" />
    <Dialog.Heading>Confirm</Dialog.Heading>
    <Dialog.Body>Proceed?</Dialog.Body>
    <Dialog.CloseButton>OK</Dialog.CloseButton>
  </Dialog.Card></Dialog.Popper>
</Dialog>
```

## Tooltip — `@workday/canvas-kit-react/tooltip`
**Purpose:** hover/focus tooltip wrapping a **single** child element (uses `cloneElement`). `createComponent`.
**Props:** `title: ReactNode` (required), `type?: 'label' | 'description' | 'muted'` (`'label'` = accessible name for icon buttons; `'description'` adds describing text; `'muted'` = no a11y wiring), `placement?: Placement` (default `'top'`), `fallbackPlacements?`, `showDelay?` (300ms), `hideDelay?` (100ms). Also `OverflowTooltip` (auto-shows on text truncation), `TooltipContainer`, `useTooltip`.
```tsx
import {Tooltip} from '@workday/canvas-kit-react/tooltip';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {plusIcon} from '@workday/canvas-system-icons-web';
<Tooltip title="Add item"><TertiaryButton icon={plusIcon} aria-label="Add item" /></Tooltip>
```

---

# 7 — Data / Table

## Table — `@workday/canvas-kit-react/table`
**Purpose:** CSS-Grid-based data table. `createComponent('table')` (`display:grid`). Accepts `Grid` style props.
**Sub-components** (render the matching semantic element): `Table.Caption` (`<caption>`), `Table.Head` (`<thead>`), `Table.Body` (`<tbody>`), `Table.Footer` (`<tfoot>`), `Table.Row` (`<tr>`; auto-derives `gridTemplateColumns` from child count, overridable via the style prop), `Table.Header` (`<th>`; use `scope="col"`/`"row"`), `Table.Cell` (`<td>`). (`BaseTable` is the flex-free base.)
Set column tracks via `cs={{gridTemplateColumns: ...}}` on `<Table>`. Link to a heading with `aria-labelledby` for accessibility; style header rows with `system.color.surface.raised`.
```tsx
import {Table} from '@workday/canvas-kit-react/table';
<Table cs={{gridTemplateColumns: '2fr 1fr 1fr'}}>
  <Table.Caption>Users</Table.Caption>
  <Table.Head><Table.Row>
    <Table.Header scope="col">Name</Table.Header>
    <Table.Header scope="col">Email</Table.Header>
    <Table.Header scope="col">Status</Table.Header>
  </Table.Row></Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Ada</Table.Cell><Table.Cell>ada@x.com</Table.Cell><Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

## Collection — `@workday/canvas-kit-react/collection`
**Purpose:** the headless Collections API powering Menu/Select/Tabs/lists. Not usually rendered directly.
**Key exports:** `ListBox`, `useListModel`, `useGridModel`; selection managers (`singleSelectionManager`, `multiSelectionManager`, `isSelected`); navigation managers (`wrappingNavigationManager`, `navigationManager`); item hooks (`useListItemRegister`, `useListItemSelect`, `useListItemRovingFocus`, `useListLoader` for virtualization/async); types `Item`, `Orientation`, util `defaultGetId`. Use when building a custom virtualized/selectable list.

## Pagination — see §4 (Navigation). Also a data component.

---

# 8 — Content / Text / Avatar / Icon

## Text — `@workday/canvas-kit-react/text`
**Purpose:** typographic primitives. Use these instead of raw font props.
- **`Text`** — `createComponent('span')` (Box-based). Props: `typeLevel?: '<level>.<size>'` where level ∈ `title | heading | body | subtext` and size ∈ `large | medium | small` (e.g. `'body.small'`), `variant?: 'error' | 'hint' | 'inverse'`. Accepts all Box style props.
- **Semantic level components** (each takes `size: 'large' | 'medium' | 'small'` and `variant?`, plus `as`):
  - `Title` → `<h1>` (56 / 48 / 40px, bold 700)
  - `Heading` → `<h2>` (32 / 28 / 24px, bold 700)
  - `BodyText` → `<p>` (20 / 18 / 16px, regular 400)
  - `Subtext` → `<p>` (14 / 12 / 10px, regular 400)
- **`LabelText`** for form labels.
```tsx
import {Title, Heading, BodyText, Subtext, Text} from '@workday/canvas-kit-react/text';
<Title size="medium">Dashboard</Title>
<Heading size="small" as="h3">Section</Heading>
<BodyText size="medium">Paragraph copy.</BodyText>
<Subtext size="small" variant="hint">Helper text</Subtext>
<Text typeLevel="body.small" variant="error">Inline error</Text>
```

## Avatar — `@workday/canvas-kit-react/avatar`
**Purpose:** user photo with initials fallback. `createComponent('div')`.
**Props:** `url?: string` (photo), `name?: string` (alt + initials fallback), `preferredInitials?`, `isDecorative?` (drop `alt` when adjacent to a name), `objectFit?` (default `'contain'`), `size?`, `variant?`. Also exports `AvatarImage`, `AvatarName`, `BaseAvatar`, `getInitialsFromName`.
```tsx
import {Avatar} from '@workday/canvas-kit-react/avatar';
<Avatar url="/me.jpg" name="Ada Lovelace" objectFit="cover" />
<Avatar name="Ada Lovelace" />  {/* initials */}
```

## Icon — `@workday/canvas-kit-react/icon`
**Purpose:** the icon family.
- **`SystemIcon`** — UI glyphs from `@workday/canvas-system-icons-web`. Props: `icon` (required), `color?` (sets fill+accent), `accent?`, `background?`, `size?: 'xxs'(14) | 'xs'(16) | 'sm'(18) | 'md'(20) | 'lg'(24) | 'xl'(32) | string | number` (default 24). Exposes `systemIconStencil`.
- **`AccentIcon`** *(deprecated v15, still shipped)* — large decorative accent icons from `@workday/canvas-accent-icons-web`; `icon`, `color?`, `transparent?`, `size?` (default 56). Used for empty-state graphics.
- **`AppletIcon`** — applet icons from `@workday/canvas-applet-icons-web`.
- **`Graphic`** — full illustrations from `@workday/canvas-graphics-web`; `src`, `width`/`height`.
- **`SystemIconCircle`**, **`ExpressiveIcon`**, **`Svg`** (`svgStencil`).
Decorative icons are `aria-hidden`; give an `aria-label` only when the icon alone conveys meaning.
```tsx
import {SystemIcon, Graphic} from '@workday/canvas-kit-react/icon';
import {activityStreamIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';
<SystemIcon icon={activityStreamIcon} size="md" color={system.color.fg.strong} />
```

---

# Preview-React additions — `@workday/canvas-kit-preview-react/*`
Newer/replacement implementations. Prefer these over the deprecated main equivalents:
- **`switch`** — replaces deprecated main `Switch` (compound: `Switch.Input` / `.Background` / `.Circle` / `.Icon` / `.Container`).
- **`status-indicator`** — the supported StatusIndicator (see §5).
- **`radio`** — newer `RadioGroup` + `useRadioModel` + `StyledRadioButton`.
- **`multi-select`** — multi-value combobox (`MultiSelect`, `MultiSelect.Input`, `useMultiSelectModel`).
- **`color-picker`** — newer ColorPicker.
- **`side-panel`** — preview SidePanel variant.
- **`divider`** — horizontal/vertical rule.
- **`loading-sparkles`** — AI/loading sparkle animation.
- **`tokens`** — preview token helpers.

---

# Final correctness checklist
1. **Theming = the four `_variables.css` imports + `CanvasProvider`** (not a JS theme object).
2. **`FormField` wraps every input** via `FormField.Input as={...}` — **except `Select`, which wraps `FormField`** (inverted nesting).
3. **`Popup` has NO default behaviors** — call `useCloseOnOutsideClick` / `useCloseOnEscape` / `useInitialFocus` / `useReturnFocus`. `Modal`/`Dialog` provide them.
4. **Deprecated in v15 → use Preview:** `Switch`, `StatusIndicator`, class-based `RadioGroup`, `AccentIcon`.
5. **`aria-label` required** on icon-only buttons, every `*.CloseIcon`, `Pill.Icon`, overflow buttons, and the `Breadcrumbs`/`Pagination` containers. Collection items wire behavior via **`data-id`**.
6. Prefer the **`cs` prop** with `system.*` tokens over inline pixel `style`; use logical properties (`marginBlockStart`, `paddingInline`) for RTL.
