# Composition archetypes — authentically Workday

> Full, copy-pasteable screens built from **real** Canvas Kit v15 components, `Flex`/`Grid`, and `system.space` rhythm. Every archetype assumes the [setup contract](./setup.md) is in place: the four token CSS files imported once at the entry point, Roboto loaded, and the whole app wrapped in `<CanvasProvider>`. Verified against R4 and the local clone at `C:\Users\kyled\canvas-kit`.

## How to read this file

Each archetype is a complete component. They share a small set of rules — internalize these once and every screen reads as Workday-native:

- **Layout = `Flex`/`Grid` + `cs` + `system.*` tokens.** Never hand-roll pixel values. R4 §2: "use `Flex`/`Grid` with `cs={{gap: system.space.xN, padding: system.space.xN}}` ... Do NOT hand-roll pixel values."
- **Spacing rhythm** (R4 §6): field/section gap = `system.gap.md` (16px) or `system.gap.lg` (24px); page padding = `system.space.x8` (32px); button-row gap = `system.gap.md`.
- **Logical properties for RTL safety** (R4 §2): `marginBlockStart`, `marginInlineEnd`, `paddingInline` — never `marginTop`/`paddingLeft`.
- **`cs` is the styling escape hatch** (R4 §1.3) — prefer it over inline `style` whenever a `system.*` token exists.
- **Text comes from components, not font props** (R4 §6): `Heading`, `BodyText`, `Subtext`, `Text`.
- **Every labeled input lives inside a `FormField`** (R4 §4.2). **Every icon-only control needs an `aria-label`** (R4 §5.9).

Imports are per-module subpaths: `@workday/canvas-kit-react/<module>`, styling from `@workday/canvas-kit-styling`, tokens from `@workday/canvas-tokens-web`, icons from `@workday/canvas-system-icons-web` / `@workday/canvas-accent-icons-web`, preview components from `@workday/canvas-kit-preview-react/<module>`.

---

## 1. App Shell — top header + collapsible SidePanel + main

`SidePanel` is a `createContainer('section')` driven by `useSidePanelModel`. R4 §4.1: "It auto-wires `id`, `aria-labelledby`, and the toggle button's `aria-controls`/`aria-expanded`(via `aria-pressed`)/`aria-describedby`. Default expanded width 320, collapsed 64. `variant`: `'standard'` (slate-50 nav bg, no depth) or `'alternate'` (white + depth 3). The toggle button **must be the first focusable element** in the panel."

`SidePanel.Heading` provides the accessible name (its `id` auto-links to the panel's `aria-labelledby`) and is hidden when collapsed.

```tsx
import * as React from 'react';
import {homeIcon, folderIcon, gearIcon, rocketIcon} from '@workday/canvas-system-icons-web';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {SidePanel, useSidePanelModel} from '@workday/canvas-kit-react/side-panel';
import {Heading, BodyText} from '@workday/canvas-kit-react/text';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const shellStyles = createStyles({height: '100vh', overflow: 'hidden'});

const headerStyles = createStyles({
  height: system.space.x16, // 64px header
  paddingInline: system.space.x6,
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: system.color.bg.default,
  borderBlockEnd: `1px solid ${system.color.border.divider}`,
});

const mainStyles = createStyles({
  flex: 1,
  padding: system.space.x8,
  overflowY: 'auto',
  backgroundColor: system.color.bg.alt.softer, // subtle app canvas
});

const navItemStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: system.gap.sm,
  padding: system.space.x3,
  borderRadius: system.shape.x1,
  color: system.color.fg.default,
  textDecoration: 'none',
  width: '100%',
});

export const AppShell = () => {
  const model = useSidePanelModel({initialTransitionState: 'expanded'});
  const expanded = model.state.transitionState === 'expanded';

  return (
    <Flex cs={shellStyles} flexDirection="column">
      {/* Top header */}
      <Flex as="header" cs={headerStyles}>
        <Flex cs={{alignItems: 'center', gap: system.gap.sm}}>
          <SystemIcon icon={rocketIcon} />
          <Heading as="h1" size="small" cs={{margin: 0}}>
            Acme Workspace
          </Heading>
        </Flex>
        <TertiaryButton icon={gearIcon} aria-label="Settings" />
      </Flex>

      {/* Body: SidePanel + main */}
      <Flex cs={{flex: 1, minHeight: 0}}>
        <SidePanel model={model} variant="standard">
          {/* ToggleButton must be the first focusable element for a11y */}
          <SidePanel.ToggleButton />
          <SidePanel.Heading size="small">Navigation</SidePanel.Heading>
          <Box as="nav" cs={{padding: system.space.x3}}>
            <a href="#home" className={navItemStyles}>
              <SystemIcon icon={homeIcon} />
              {expanded && <span>Home</span>}
            </a>
            <a href="#projects" className={navItemStyles}>
              <SystemIcon icon={folderIcon} />
              {expanded && <span>Projects</span>}
            </a>
          </Box>
        </SidePanel>

        <Box as="main" cs={mainStyles}>
          <Heading as="h2" size="medium" cs={{marginBlockEnd: system.gap.md}}>
            Dashboard
          </Heading>
          <BodyText size="medium">Main content region.</BodyText>
        </Box>
      </Flex>
    </Flex>
  );
};
```

**DO** put the `<SidePanel.ToggleButton />` first inside the panel. **DO** gate nav labels on `expanded` so the collapsed rail shows icons only. **DON'T** set the panel width manually — the model animates 320↔64 and finalizes state via `onTransitionEnd` (only on `propertyName === 'width'`). **DON'T** use `marginLeft`/`borderLeft` — `origin: 'start' | 'end'` flips the panel side using logical properties for RTL correctness.

---

## 2. Form page — `FormField` + `TextInput`/`Select` + Primary/Secondary button row

`FormField` is a `createContainer('div')` (model `useFormFieldModel`) that **auto-associates** label↔input↔hint via a generated id. R4 §4.2: "The stencil sets `margin: 0 0 system.legacy.gap.lg` (bottom margin between fields) ... So **you usually do not add manual spacing between FormFields** — the stencil handles it."

Put the primary action **first** in LTR reading order inside a `Flex` with `gap: system.gap.md`.

```tsx
import * as React from 'react';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {TextArea} from '@workday/canvas-kit-react/text-area';
import {Select} from '@workday/canvas-kit-react/select';
import {PrimaryButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {Heading} from '@workday/canvas-kit-react/text';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const pageStyles = createStyles({
  maxWidth: '40rem',
  marginInline: 'auto',
  padding: system.space.x8,
});

const actionsStyles = createStyles({
  gap: system.gap.md,
  marginBlockStart: system.gap.lg,
});

const COUNTRIES = ['United States', 'Canada', 'Mexico'];

export const FormPage = () => {
  const [email, setEmail] = React.useState('');
  const emailInvalid = email.length > 0 && !email.includes('@');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate + submit
  };

  return (
    <Box as="form" cs={pageStyles} onSubmit={onSubmit}>
      <Heading as="h2" size="medium" cs={{marginBlockEnd: system.gap.lg}}>
        Create account
      </Heading>

      <FormField>
        <FormField.Label>First name</FormField.Label>
        <FormField.Input as={TextInput} name="first" />
      </FormField>

      <FormField error={emailInvalid ? 'error' : undefined} required>
        <FormField.Label>Email</FormField.Label>
        <FormField.Field>
          <FormField.Input
            as={TextInput}
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <FormField.Hint>
            {emailInvalid ? 'Enter a valid email address.' : 'We will never share it.'}
          </FormField.Hint>
        </FormField.Field>
      </FormField>

      <FormField>
        <FormField.Label>Country</FormField.Label>
        <FormField.Field>
          <Select items={COUNTRIES}>
            <FormField.Input as={Select.Input} name="country" />
            <Select.Popper>
              <Select.Card>
                <Select.List>{item => <Select.Item>{item}</Select.Item>}</Select.List>
              </Select.Card>
            </Select.Popper>
          </Select>
        </FormField.Field>
      </FormField>

      <FormField grow>
        <FormField.Label>Notes</FormField.Label>
        <FormField.Input as={TextArea} name="notes" />
      </FormField>

      <Flex cs={actionsStyles}>
        <PrimaryButton type="submit">Save</PrimaryButton>
        <SecondaryButton type="button">Cancel</SecondaryButton>
      </Flex>
    </Box>
  );
};
```

Rules that make it feel Workday (R4 §4.2):

1. **Every input lives inside a `FormField`** with a `FormField.Label`. Never use a bare `<TextInput>` for a labeled field.
2. For inputs needing hint text or horizontal layout, wrap input+hint in `FormField.Field`.
3. `Select` requires the `Select.Input as` pattern with `Select.Popper > Select.Card > Select.List` (render-prop maps items).
4. `grow` makes a field/input full-width.
5. Use `error="error"` (red) or `error="caution"` (amber) — the stencil applies the correct border + inset focus ring automatically. **DON'T** color the input border by hand.

Button sizes: `extraSmall | small | medium | large` (default `medium`). Variants (R4 §4.2): `PrimaryButton` (filled blue pill), `SecondaryButton` (outlined), `TertiaryButton` (text), `DeleteButton` (red).

---

## 3. Data Table page — `Table` + `Pagination` + row-actions `Menu` + `StatusIndicator`

`Table` is a CSS-Grid based compound: `Table.Caption`, `Table.Head`, `Table.Body`, `Table.Footer`, `Table.Row`, `Table.Header` (`<th>`, use `scope="col"`/`"row"`), `Table.Cell` (`<td>`). R4 §4.3: "link the table to a heading with `aria-labelledby` ... and use `scope` on headers. Style header row background with `system.color.surface.raised`."

Status uses the **Preview** package: R4 §4.3 — "in v15 the `status-indicator` in `@workday/canvas-kit-react` is deprecated → use the Preview version `@workday/canvas-kit-preview-react/status-indicator`." Row actions = a `Menu` whose target is a `TertiaryButton` with an icon.

```tsx
import * as React from 'react';
import {Table} from '@workday/canvas-kit-react/table';
import {Menu} from '@workday/canvas-kit-react/menu';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {StatusIndicator} from '@workday/canvas-kit-preview-react/status-indicator';
import {
  Pagination,
  getLastPage,
  getVisibleResultsMin,
  getVisibleResultsMax,
} from '@workday/canvas-kit-react/pagination';
import {Heading} from '@workday/canvas-kit-react/text';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {AccessibleHide, useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {relatedActionsIcon, editIcon, trashIcon} from '@workday/canvas-system-icons-web';

const headerCell = createStyles({backgroundColor: system.color.surface.raised});
const wrapper = createStyles({padding: system.space.x8});

const titleRow = createStyles({
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBlockEnd: system.gap.md,
});

const paginationRow = createStyles({
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBlockStart: system.gap.md,
});

type Row = {id: string; name: string; owner: string; status: 'published' | 'unpublished' | 'failed'};

const DATA: Row[] = [
  {id: '1', name: 'Q3 Forecast', owner: 'A. Lee', status: 'published'},
  {id: '2', name: 'Headcount Plan', owner: 'M. Cruz', status: 'unpublished'},
  {id: '3', name: 'Budget Import', owner: 'R. Singh', status: 'failed'},
];

const statusVariant = {published: 'positive', unpublished: undefined, failed: 'critical'} as const;

const RowActions = ({rowName}: {rowName: string}) => (
  <Menu onSelect={data => console.log(data.id)}>
    <Menu.Target as={TertiaryButton} icon={relatedActionsIcon} aria-label={`Actions for ${rowName}`} />
    <Menu.Popper>
      <Menu.Card>
        <Menu.List>
          <Menu.Item data-id="edit">
            <Menu.Item.Icon icon={editIcon} />
            <Menu.Item.Text>Edit</Menu.Item.Text>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item data-id="delete">
            <Menu.Item.Icon icon={trashIcon} />
            <Menu.Item.Text>Delete</Menu.Item.Text>
          </Menu.Item>
        </Menu.List>
      </Menu.Card>
    </Menu.Popper>
  </Menu>
);

export const DataTablePage = () => {
  const headingId = useUniqueId();
  const resultCount = 10;
  const totalCount = 100;
  const [page, setPage] = React.useState(1);
  const lastPage = getLastPage(resultCount, totalCount);

  return (
    <Box cs={wrapper}>
      <Flex cs={titleRow}>
        <Heading as="h2" id={headingId} size="medium" cs={{margin: 0}}>
          Workbooks
        </Heading>
      </Flex>

      <Table aria-labelledby={headingId} cs={{gridTemplateColumns: '2fr 1fr 1fr auto'}}>
        <Table.Head>
          <Table.Row>
            <Table.Header scope="col" cs={headerCell}>Name</Table.Header>
            <Table.Header scope="col" cs={headerCell}>Owner</Table.Header>
            <Table.Header scope="col" cs={headerCell}>Status</Table.Header>
            <Table.Header scope="col" cs={headerCell}>
              <AccessibleHide>Actions</AccessibleHide>
            </Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {DATA.map(row => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.name}</Table.Cell>
              <Table.Cell>{row.owner}</Table.Cell>
              <Table.Cell>
                <StatusIndicator variant={statusVariant[row.status]}>
                  <StatusIndicator.Label>{row.status}</StatusIndicator.Label>
                </StatusIndicator>
              </Table.Cell>
              <Table.Cell>
                <RowActions rowName={row.name} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Flex cs={paginationRow}>
        <Pagination aria-label="Pagination" lastPage={lastPage} onPageChange={n => setPage(n)}>
          <Pagination.Controls>
            <Pagination.StepToPreviousButton aria-label="Previous" />
            <Pagination.PageList>
              {({state}) =>
                state.range.map(n => (
                  <Pagination.PageListItem key={n}>
                    <Pagination.PageButton aria-label={`Page ${n}`} pageNumber={n} />
                  </Pagination.PageListItem>
                ))
              }
            </Pagination.PageList>
            <Pagination.StepToNextButton aria-label="Next" />
          </Pagination.Controls>
          <Pagination.AdditionalDetails>
            {({state}) =>
              `${getVisibleResultsMin(state.currentPage, resultCount)}-${getVisibleResultsMax(
                state.currentPage,
                resultCount,
                totalCount
              )} of ${totalCount} results`
            }
          </Pagination.AdditionalDetails>
        </Pagination>
      </Flex>
    </Box>
  );
};
```

Notes (R4 §4.3): Because `Table` is CSS Grid, set column tracks via `cs={{gridTemplateColumns: ...}}` on `<Table>` — **DON'T** width cells individually. `getLastPage`, `getVisibleResultsMin`, `getVisibleResultsMax` are real exported helpers. The actions column header is visually empty but named for AT via `AccessibleHide`. Every icon-only button **must** have `aria-label`. `StatusIndicator` pairs an optional icon + a `StatusIndicator.Label` so meaning is never color-only.

> **Legacy v15 alternative** (still shipped, deprecated): `import {StatusIndicator} from '@workday/canvas-kit-react/status-indicator'` with `type={StatusIndicator.Type.Green | .Red | .Orange | .Blue | .Gray | .Transparent}`, `emphasis`, `label`, `icon`. Prefer the preview version for new work.

---

## 4. Settings / detail layout — two-column `Grid` + section `Card`s + `Tabs`

R4 §4.4: "Use `Grid` for the page scaffold, `Card` (or a `Box` with depth) for grouped settings, and `Tabs` for switching detail panes. ... Tabs handle all roving-tabindex + `aria-controls`/`aria-selected`/`role="tab"`/`role="tabpanel"` wiring; `Tabs.Item` and `Tabs.Panel` are matched by order (or by a shared `data-id`)."

```tsx
import {Grid, Flex, Box} from '@workday/canvas-kit-react/layout';
import {Card} from '@workday/canvas-kit-react/card';
import {Tabs} from '@workday/canvas-kit-react/tabs';
import {Heading, BodyText, Subtext} from '@workday/canvas-kit-react/text';
import {Switch} from '@workday/canvas-kit-react/switch';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const page = createStyles({padding: system.space.x8});

const layout = createStyles({
  gridTemplateColumns: '16rem 1fr',
  gap: system.space.x8,
  alignItems: 'start',
});

const sectionCard = createStyles({marginBlockEnd: system.gap.lg});

export const SettingsPage = () => (
  <Box cs={page}>
    <Heading as="h1" size="large" cs={{marginBlockEnd: system.gap.lg}}>
      Settings
    </Heading>
    <Grid cs={layout}>
      {/* Left rail — section nav (could also be a vertical Tabs) */}
      <Box as="nav" aria-label="Settings sections">
        <BodyText size="medium" cs={{fontWeight: cssVar(system.fontWeight.bold)}}>
          Account
        </BodyText>
        <BodyText size="medium" cs={{color: system.color.fg.muted.default}}>
          Notifications
        </BodyText>
        <BodyText size="medium" cs={{color: system.color.fg.muted.default}}>
          Security
        </BodyText>
      </Box>

      {/* Right detail */}
      <Box>
        <Tabs>
          <Tabs.List>
            <Tabs.Item>Profile</Tabs.Item>
            <Tabs.Item>Preferences</Tabs.Item>
          </Tabs.List>
          <Box cs={{marginBlockStart: system.gap.lg}}>
            <Tabs.Panel>
              <Card cs={sectionCard}>
                <Card.Heading>Profile</Card.Heading>
                <Card.Body>
                  <FormField>
                    <FormField.Label>Display name</FormField.Label>
                    <FormField.Input as={TextInput} />
                  </FormField>
                  <PrimaryButton>Save changes</PrimaryButton>
                </Card.Body>
              </Card>
            </Tabs.Panel>
            <Tabs.Panel>
              <Card cs={sectionCard}>
                <Card.Heading>Preferences</Card.Heading>
                <Card.Body>
                  <Flex cs={{alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box>
                      <BodyText size="medium">Email digests</BodyText>
                      <Subtext size="medium" cs={{color: system.color.fg.muted.default}}>
                        Weekly summary email
                      </Subtext>
                    </Box>
                    <Switch aria-label="Toggle email digests" />
                  </Flex>
                </Card.Body>
              </Card>
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Box>
    </Grid>
  </Box>
);
```

**DO** give the left rail a landmark (`as="nav" aria-label`). **DO** group related settings in a `Card` (`Card.Heading` + `Card.Body`). **DON'T** count `Tabs.Item`/`Tabs.Panel` by index in your head — they pair by order automatically; if you reorder, add matching `name` props. Secondary copy uses `system.color.fg.muted.default`.

---

## 5. Empty states

R4 §4.5: "Canvas has no single 'EmptyState' component in v15 — the idiom is a centered `Flex` column with an `AccentIcon`/`Graphic`, a `Heading`, supporting `BodyText`, and a `PrimaryButton` CTA. Use `system.color.fg.muted.default` for the supporting copy."

```tsx
import {Flex} from '@workday/canvas-kit-react/layout';
import {AccentIcon} from '@workday/canvas-kit-react/icon';
import {Heading, BodyText} from '@workday/canvas-kit-react/text';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {rocketIcon} from '@workday/canvas-accent-icons-web';
import {plusIcon} from '@workday/canvas-system-icons-web';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const empty = createStyles({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: system.gap.md,
  padding: system.space.x16,
  minHeight: '20rem',
});

export const EmptyState = () => (
  <Flex cs={empty}>
    <AccentIcon icon={rocketIcon} size={80} />
    <Heading as="h2" size="small" cs={{margin: 0}}>
      No projects yet
    </Heading>
    <BodyText size="medium" cs={{color: system.color.fg.muted.default, maxWidth: '24rem'}}>
      Create your first project to start collaborating with your team.
    </BodyText>
    <PrimaryButton icon={plusIcon}>Create project</PrimaryButton>
  </Flex>
);
```

**DO** keep one clear CTA and one line of supporting copy. **DO** constrain the copy width (`maxWidth: '24rem'`) so it reads as a column, not a banner. **DON'T** invent an `<EmptyState>` import — it doesn't exist in v15. `AccentIcon` is decorative (`aria-hidden` by default).

---

## 6. Dialog / Modal confirm flow

R4 §4.6: "**Modal** = focus-trapping overlay for required decisions (covers the page, has a scrim). **Dialog** = a popup anchored to a target (popper), lighter weight. Both are `createContainer` over `usePopupModel` ... : focus trap, return focus, close on escape, close on outside click, assistive hide siblings."

Modal anatomy: `Modal > Modal.Target > Modal.Overlay > Modal.Card > {Modal.CloseIcon, Modal.Heading, Modal.Body, Modal.CloseButton}`. `Modal.Target` defaults to a button (pass `as={PrimaryButton}` / `icon=`). `Modal.CloseButton` closes on click; render `as={...}` for the confirm action. `Modal.CloseIcon` requires `aria-label`. Button row = `Flex` with `gap: system.gap.md`, `padding: system.padding.xs`.

```tsx
import {Modal, useModalModel} from '@workday/canvas-kit-react/modal';
import {DeleteButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {system} from '@workday/canvas-tokens-web';

export const ConfirmDelete = ({onConfirm}: {onConfirm: () => void}) => {
  const model = useModalModel();
  return (
    <Modal model={model}>
      <Modal.Target as={DeleteButton}>Delete workbook</Modal.Target>
      <Modal.Overlay>
        <Modal.Card>
          <Modal.CloseIcon aria-label="Close" />
          <Modal.Heading>Delete this workbook?</Modal.Heading>
          <Modal.Body>
            <Box as="p" cs={{marginBlock: 0}}>
              This action cannot be undone. All data in this workbook will be permanently removed.
            </Box>
          </Modal.Body>
          <Flex cs={{gap: system.gap.md, paddingBlock: system.padding.xs}}>
            <Modal.CloseButton
              as={DeleteButton}
              onClick={() => {
                onConfirm();
              }}
            >
              Delete
            </Modal.CloseButton>
            <Modal.CloseButton as={SecondaryButton}>Cancel</Modal.CloseButton>
          </Flex>
        </Modal.Card>
      </Modal.Overlay>
    </Modal>
  );
};
```

For a **form inside a modal** (R4 §4.6), render `Modal.Card as="form" onSubmit={...}`, use a `PrimaryButton type="submit"`, and call `model.events.hide()` on success. A **Dialog** uses `Dialog.Target / Dialog.Popper / Dialog.Card / Dialog.Heading / Dialog.Body / Dialog.CloseIcon / Dialog.CloseButton`.

**DO** put the confirming action first (LTR). **DO** match the destructive verb to a `DeleteButton`. **DON'T** wire your own focus trap, Esc handler, or scrim — the model does all of it. **DON'T** forget `aria-label` on `Modal.CloseIcon`.

---

## 7. Banner + Toast feedback

R4 §4.7: "**Banner** = persistent inline/page-level message (e.g. '3 Errors') with an action. Compound: `Banner > Banner.Icon > Banner.Label > Banner.ActionText`. `hasError` switches to critical styling; `isSticky` for pinned banners."

"**Toast** = transient notification. Compound: `Toast > Toast.Icon (icon=, color=) > Toast.Body > Toast.Message`, optional `Toast.Link`, `Toast.CloseIcon`. To make a toast announce to screen readers and behave as a dialog, render it in a `Popper` with `mode="dialog"` and `aria-label`."

```tsx
import * as React from 'react';
import {Banner} from '@workday/canvas-kit-react/banner';
import {Toast} from '@workday/canvas-kit-react/toast';
import {Popper} from '@workday/canvas-kit-react/popup';
import {checkIcon, exclamationCircleIcon} from '@workday/canvas-system-icons-web';
import {system} from '@workday/canvas-tokens-web';

export const ErrorBanner = () => (
  <Banner
    hasError
    onClick={() => {
      /* navigate to the error list */
    }}
  >
    <Banner.Icon />
    <Banner.Label>3 Errors</Banner.Label>
    <Banner.ActionText>View All</Banner.ActionText>
  </Banner>
);

export const SuccessToast = ({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}) => (
  <Popper placement="bottom-end" open={open} anchorElement={anchorRef}>
    <Toast mode="dialog" aria-label="notification">
      <Toast.Icon icon={checkIcon} color={system.color.fg.positive.default} />
      <Toast.Body>
        <Toast.Message>Your workbook was successfully processed.</Toast.Message>
      </Toast.Body>
      <Toast.CloseIcon aria-label="Close notification" onClick={onClose} />
    </Toast>
  </Popper>
);
```

R4 §4.7 color guidance: "Use `system.color.fg.positive.default` (green) for success icon, `system.color.fg.critical.default` for errors." **DO** use a Banner for persistent, page-level state and a Toast for transient confirmations. **DON'T** strip the icon — pairing icon + text keeps the message accessible (never color-only). **DON'T** forget `aria-label` on `Toast.CloseIcon`. For an interactive Toast, the `Popper` + `mode="dialog"` pattern makes it focus-trappable and announced; a plain status Toast renders its own `aria-live` region.

---

## Spacing & token quick reference (R4 §3, §6)

| Use | Token | px |
|---|---|---|
| Page padding | `system.space.x8` | 32 |
| Section / block rhythm | `system.gap.lg` | 24 |
| Field gap, button-row gap | `system.gap.md` | 16 |
| Icon ↔ label, input padding | `system.gap.sm` / `system.padding.xs` | 8 |
| Header height | `system.space.x16` | 64 |
| Card / input radius | `system.shape.x2` | 8px |
| Buttons | pill (`system.legacy.shape.full`) | — |
| Header / divider border | `system.color.border.divider` | — |
| Raised surfaces (table header, cards) | `system.color.surface.raised` / `system.depth[1]` | — |
| Subtle app canvas | `system.color.bg.alt.softer` | — |
| Secondary text | `system.color.fg.muted.default` | — |

See [tokens.md](./tokens.md) for the complete scale and [accessibility.md](./accessibility.md) for the focus-ring, model/hook, and ARIA playbook these archetypes rely on.
