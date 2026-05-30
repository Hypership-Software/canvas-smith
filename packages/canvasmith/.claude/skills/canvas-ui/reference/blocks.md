# Canvasmith registry — BLOCK CATALOG

The Canvasmith registry is a **shadcn-compatible** registry of Workday-Canvas-themed React components. Every item is **real `@workday/canvas-kit-react` code**, styled only with `createStyles`/`createStencil` + `cssVar(system.*)` Canvas tokens (zero Tailwind, zero hardcoded hex/px), fully typed (each exports a `Props` interface), and a11y-complete (FormField wiring, focus management via Canvas models/hooks, `aria-label`s on icon-only controls).

**Adding a block is decision-hierarchy LEVEL 1** — the most deterministic path to Workday-native UI. Reach for a block before composing Canvas primitives (level 2) or authoring a new stencil (level 3). See the parent `canvas-ui` skill for the full hierarchy.

## How to add

- **`/canvasmith:add <block>`** — preferred. CLI-bypass: copies the item's files (resolving `registryDependencies` recursively), installs the Canvas deps with the detected package manager, prints the docs. No Tailwind, no `components.json` required.
- **`npx shadcn@latest add https://canvasmith.dev/r/<block>.json`** — alternate, for Tailwind/shadcn projects (items carry no `cssVars`/`css`, so the copy works). Or, after adding `"@canvasmith": "https://canvasmith.dev/r/{name}.json"` to `components.json`'s `registries`, `npx shadcn@latest add @canvasmith/<block>`.

**Prerequisite:** the project must be set up with Canvas Kit (`/canvasmith:init`) — token CSS imports + `CanvasProvider` + Roboto — or blocks render unstyled.

**Install destinations** (defaults; consumer `components.json` aliases win): `registry:ui`/`registry:component` → `components/canvasmith/`, `registry:hook` → `hooks/`, `registry:page` → the file's `target` (e.g. `app/<name>/page.tsx`). Cross-item imports use the `@/registry/canvasmith/...` alias in source and are rewritten on install.

---

## Display & content

### stat-card
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/stat-card.tsx`
- **Add:** `/canvasmith:add stat-card` · `npx shadcn@latest add https://canvasmith.dev/r/stat-card.json`
- **Description:** A KPI metric tile — label, value, and an optional trend delta.
- **Composes:** Canvas `Card` + type tokens (`system.type.*` via `Heading`/`Subtext`) + a preview `StatusIndicator` / delta arrow (`SystemIcon`) for the trend, colored with status foreground tokens.
- **Key props:** `label: string`, `value: string | number`, `trend?: { direction: 'up' | 'down' | 'flat'; value: string; intent?: 'positive' | 'negative' | 'neutral' }`, `icon?` (Canvas system icon), `cs?`.
- **Use it when:** you need a single metric in a dashboard/overview grid. **Compose by hand when:** the tile needs a chart/sparkline or bespoke internal layout beyond label/value/trend.

### empty-state
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/empty-state.tsx`
- **Add:** `/canvasmith:add empty-state` · `npx shadcn@latest add https://canvasmith.dev/r/empty-state.json`
- **Description:** A centered zero-data / first-run view with an icon, message, and a call to action.
- **Composes:** Canvas `SystemIcon` (soft icon color) + `Heading` + `BodyText` + a primary CTA (`PrimaryButton`), laid out on the space scale with `Flex`.
- **Key props:** `icon` (Canvas system icon), `title: string`, `description?: string`, `action?: { label: string; onClick: () => void }`, optional secondary action.
- **Use it when:** a table/list/page has no data yet, or a search/filter returns nothing. **Compose by hand when:** the empty view needs an illustration, multiple CTAs with custom hierarchy, or inline onboarding steps.

### page-header
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/page-header.tsx`
- **Add:** `/canvasmith:add page-header` · `npx shadcn@latest add https://canvasmith.dev/r/page-header.json`
- **Description:** A page title bar with breadcrumbs and a right-aligned action cluster.
- **Composes:** Canvas `Breadcrumbs` + `Heading` (page title) + an action cluster of `PrimaryButton`/`SecondaryButton`/`TertiaryButton`, arranged with `Flex` and the gap tokens.
- **Key props:** `title: string`, `breadcrumbs?: { label: string; href?: string }[]`, `actions?: React.ReactNode`, `description?: string`.
- **Use it when:** any detail/list/settings page needs a consistent title + breadcrumb + actions row. **Compose by hand when:** you need a tab strip fused into the header (use `page-tabs`) or a complex multi-row header with filters baked in.

---

## Inputs & forms

### settings-form
- **Type:** `registry:component` · **Source:** `registry/canvasmith/blocks/settings-form.tsx`
- **Add:** `/canvasmith:add settings-form` · `npx shadcn@latest add https://canvasmith.dev/r/settings-form.json`
- **Description:** A grouped settings form with sectioned fields and a sticky save bar.
- **Composes:** Canvas `FormField` groups (`FormField.Label` + `FormField.Input as={...}` + `FormField.Hint`) wrapping `TextInput`/`Select`/`Switch` (preview), grouped into `Card`/`Flex` sections, with a sticky footer holding `PrimaryButton` (Save) + `SecondaryButton` (Cancel) and a dirty-state guard.
- **Key props:** `sections: { title: string; description?: string; fields: FieldConfig[] }[]`, `values`, `onChange`, `onSave`, `onCancel`, `isSaving?`, `isDirty?`.
- **Use it when:** building any account/profile/workspace settings surface with multiple grouped fields. **Compose by hand when:** the form is a single short field set (just use a `FormField` group) or needs a wizard/stepper flow.

### filter-bar
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/filter-bar.tsx`
- **Add:** `/canvasmith:add filter-bar` · `npx shadcn@latest add https://canvasmith.dev/r/filter-bar.json`
- **Description:** A toolbar row of filters: dropdowns, a segmented/pill toggle, and a search field.
- **Composes:** Canvas `Select`/`Combobox` (preview) + `Pill` or `SegmentedControl` + a search `TextInput`, arranged in a wrapping `Flex` toolbar with gap tokens.
- **Key props:** `search?: { value: string; onChange: (v: string) => void; placeholder?: string }`, `selects?: SelectConfig[]`, `segments?: { value: string; options: {label; value}[]; onChange }`, `actions?: React.ReactNode`.
- **Use it when:** a `data-table` or list view needs faceted filtering + search above it. **Compose by hand when:** filtering is a single search box (inline a `TextInput`) or requires a full advanced-filter builder/popover.

---

## Interaction

### confirm-dialog
- **Type:** `registry:ui` (+ `registry:hook`) · **Source:** `registry/canvasmith/ui/confirm-dialog.tsx` + `registry/canvasmith/hooks/use-confirm-dialog.tsx`
- **Add:** `/canvasmith:add confirm-dialog` · `npx shadcn@latest add https://canvasmith.dev/r/confirm-dialog.json`
- **Description:** A promise-based confirmation dialog for destructive/irreversible actions.
- **Composes:** Canvas `Modal`/`Dialog` (focus-trapping, `useModalModel`) + body copy + `PrimaryButton` (or `DeleteButton` for destructive intent) + `SecondaryButton` (cancel) + `Modal.CloseIcon`. Ships the `useConfirmDialog` hook that returns a `confirm(opts) => Promise<boolean>`.
- **Key props (hook + component):** `confirm({ title, body, confirmLabel?, cancelLabel?, intent?: 'default' | 'delete' })`; `<ConfirmDialogProvider>` mounted near the app root.
- **Use it when:** any action needs a "are you sure?" gate, especially deletes. **Compose by hand when:** the confirmation requires a multi-field form (use `Modal` directly) or non-blocking inline undo (use `toast-center`).

### toast-center
- **Type:** `registry:ui` (+ `registry:hook`) · **Source:** `registry/canvasmith/ui/toast-center.tsx` + `registry/canvasmith/hooks/use-toast.tsx`
- **Add:** `/canvasmith:add toast-center` · `npx shadcn@latest add https://canvasmith.dev/r/toast-center.json`
- **Description:** A transient notification queue (toasts) with a banner-style variant for persistent messages.
- **Composes:** Canvas `Toast` + `Banner`, managed by a queue with an `AriaLiveRegion` for announcements; ships the `useToast` hook (`toast.success/error/info`).
- **Key props (hook + provider):** `toast({ message, intent?: 'info' | 'success' | 'error' | 'caution', duration?, action? })`; `<ToastProvider>` mounted near the app root.
- **Use it when:** you need transient success/error feedback after async actions. **Compose by hand when:** the message must be persistent and page-level (use a single `Banner`) or is a blocking decision (use `confirm-dialog`).

### page-tabs
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/page-tabs.tsx`
- **Add:** `/canvasmith:add page-tabs` · `npx shadcn@latest add https://canvasmith.dev/r/page-tabs.json`
- **Description:** A tabbed layout that switches body content, bound to Canvas `Tabs`.
- **Composes:** Canvas `Tabs` (`Tabs.List` + `Tabs.Item` + `Tabs.Panel`, overflow-aware, `useTabsModel` for roving focus/keyboard) wired to a content-switch shell.
- **Key props:** `tabs: { id: string; label: string; content: React.ReactNode }[]`, `defaultTab?`, `onTabChange?`.
- **Use it when:** a page or detail view has 2–7 sibling views (Overview / Activity / Settings). **Compose by hand when:** tabs drive separate routes (use the router + `Tabs`) or you need vertical/segmented navigation.

### user-menu
- **Type:** `registry:ui` · **Source:** `registry/canvasmith/ui/user-menu.tsx`
- **Add:** `/canvasmith:add user-menu` · `npx shadcn@latest add https://canvasmith.dev/r/user-menu.json`
- **Description:** An account/profile menu triggered from an avatar in the header.
- **Composes:** Canvas `Avatar` as the trigger + `Menu` (`useMenuModel`, overflow-aware) of account actions (profile, settings, sign out), with the user name/email in the menu header.
- **Key props:** `user: { name: string; email?: string; avatarUrl?: string }`, `items: { label: string; icon?; onClick: () => void; intent?: 'default' | 'delete' }[]`.
- **Use it when:** the app header needs an account dropdown. **Compose by hand when:** you need a richer mega-menu or a notification tray (different model).

---

## Structure

### app-shell
- **Type:** `registry:component` · **Source:** `registry/canvasmith/blocks/app-shell.tsx`
- **Add:** `/canvasmith:add app-shell` · `npx shadcn@latest add https://canvasmith.dev/r/app-shell.json`
- **Description:** The top-level app layout: a header, a collapsible left nav, and a main content region.
- **Composes:** a header row (brand + `user-menu` slot) + Canvas `SidePanel` (expand/collapse via `useSidePanelModel`, `SidePanel.ToggleButton`) for left nav + a scrollable `main` region, laid out with `Flex`/`Grid` and depth/space tokens.
- **Key props:** `header?: React.ReactNode`, `nav: NavItem[]`, `activeNavId?`, `onNavChange?`, `children` (main content), `defaultCollapsed?`.
- **Use it when:** building a full authenticated app frame. **Compose by hand when:** the page is a standalone/marketing layout, or you need a top-nav-only shell with no side panel.

### data-table
- **Type:** `registry:block` · **Source:** `registry/canvasmith/blocks/data-table.tsx`
- **Add:** `/canvasmith:add data-table` · `npx shadcn@latest add https://canvasmith.dev/r/data-table.json`
- **Description:** A full-featured, generic data table: sortable columns, row selection, search, and pagination.
- **Composes:** Canvas `Table` (`Table.Head`/`Table.Body`/`Table.Row`/`Table.Cell`) + sortable header buttons + `Checkbox` row-select (with a select-all header) + a `TextInput` search + `Pagination` (`usePaginationModel`). Generic over row shape via `columns`/`data` props.
- **Key props:** `columns: Column<T>[]` (`{ id, header, accessor, sortable?, align?, render? }`), `data: T[]`, `getRowId`, `selectable?`, `onSelectionChange?`, `pageSize?`, `searchable?`, `onSearch?`, `emptyState?` (pairs with `empty-state`).
- **Use it when:** any list of records needs sorting/selection/pagination/search. **Compose by hand when:** the data is a tiny static list (use `Table` directly) or needs virtualization/grouping/tree rows beyond this block's scope.

### detail-drawer
- **Type:** `registry:component` · **Source:** `registry/canvasmith/blocks/detail-drawer.tsx`
- **Add:** `/canvasmith:add detail-drawer` · `npx shadcn@latest add https://canvasmith.dev/r/detail-drawer.json`
- **Description:** A right-side expand/collapse panel that shows a selected record's detail plus actions.
- **Composes:** Canvas `SidePanel` (expand/collapse, `useSidePanelModel`) wrapping a detail record layout (label/value rows on type tokens) + an action footer (`PrimaryButton`/`SecondaryButton`/`DeleteButton`) + close affordance.
- **Key props:** `open: boolean`, `onClose: () => void`, `title: string`, `record: React.ReactNode | FieldRow[]`, `actions?: React.ReactNode`, `width?`.
- **Use it when:** a list/table needs an inline detail view without a full route change (master-detail). **Compose by hand when:** the detail is a full page (route to it) or a blocking edit form (use a `Modal`).

---

## Full pages

These are `registry:block` items that include a `registry:page` file whose `target` is `app/<name>/page.tsx`. They compose the other registry items via the `@/registry/canvasmith/...` alias, so adding one pulls its dependencies automatically.

### dashboard
- **Type:** `registry:block` (page) · **Source:** `registry/canvasmith/blocks/dashboard/page.tsx` · **Target:** `app/dashboard/page.tsx`
- **Add:** `/canvasmith:add dashboard` · `npx shadcn@latest add https://canvasmith.dev/r/dashboard.json`
- **Description:** A complete dashboard page — app frame, header, KPI grid, and a recent-records table.
- **Composes (registryDependencies):** `app-shell` + `page-header` + a grid of `stat-card` + `data-table`.
- **Use it when:** you want a ready-made overview screen to adapt with real data. **Compose by hand when:** the dashboard layout is highly bespoke (custom charts, non-grid composition).

### list-detail
- **Type:** `registry:block` (page) · **Source:** `registry/canvasmith/blocks/list-detail/page.tsx` · **Target:** `app/list-detail/page.tsx`
- **Add:** `/canvasmith:add list-detail` · `npx shadcn@latest add https://canvasmith.dev/r/list-detail.json`
- **Description:** A master-detail page — a records table on the left, a detail drawer on the right.
- **Composes (registryDependencies):** `app-shell` + `data-table` + `detail-drawer`.
- **Use it when:** building a records-management screen where selecting a row reveals its detail. **Compose by hand when:** the detail is a separate route, or the list needs a board/kanban layout.

---

## When to add a block vs. compose by hand (rule of thumb)

- **Add the block** when a canonical item matches the need closely enough to adapt — it is real Canvas Kit, token-correct, a11y-complete, and saves you the level-2 composition. This is the default first move (level 1).
- **Compose Canvas primitives by hand** (level 2, per `patterns.md`) when no block fits the structure, when you only need one small primitive (a single `FormField`, a static `Table`), or when the block would need more deletion than reuse.
- **Author a stencil** (level 3, `/canvasmith:component`) only when you need a primitive that doesn't exist in Canvas Kit at all.

Never hand-roll a generic `<div>`/`<button>`/`<input>` when a block or Canvas primitive exists.
