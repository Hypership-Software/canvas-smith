---
name: audit
description: Audit a front-end for Workday Canvas fidelity and accessibility, emitting a prioritized P0-P3 punch-list. Invoke for /canvasmith:audit — flags off-brand colors, non-token spacing/radius, raw hex/px, stripped or missing focus rings, inputs not wrapped in FormField, missing aria-labels, emoji or non-Canvas icons, and use of non-Canvas component libraries (MUI, Chakra, shadcn, Bootstrap, Tailwind utility colors). Use when a user asks to "audit", "review for Workday/Canvas compliance", "find off-brand issues", or "check accessibility" of UI.
user-invokable: true
license: MIT
args:
  - name: target
    description: File, directory, or glob to audit (e.g. "src/pages/Dashboard.tsx" or "src/**/*.tsx"). Defaults to changed files / the current working directory.
    required: false
---

# /canvasmith:audit — Workday Canvas fidelity + a11y punch-list

Read the target, find everything that breaks Workday-native look, feel, or accessibility, and emit a **prioritized, actionable punch-list**. This skill REPORTS (it does not auto-fix) — each finding names the fix and the skill that applies it (`/canvasmith:tokens`, `/canvasmith:convert`, or a direct edit). Ground every check in the verified references:

- Tokens / brand colors / spacing / radius -> **`../canvas-ui/reference/tokens.md`**
- Focus rings, FormField, aria, icons, keyboard -> **`../canvas-ui/reference/accessibility.md`**

## Workflow

1. Resolve `target` (given scope, else git-changed files, else ask). Scan `.ts/.tsx/.js/.jsx/.css/.scss`.
2. Run every check below across the files.
3. Assign each finding a severity P0–P3 (rubric below).
4. Emit the punch-list in the exact output format. Sort by severity (P0 first), then by file.
5. End with a one-line summary count per severity and the recommended next command.

## Severity rubric

- **P0 — Broken / inaccessible.** Blocks a user or fails accessibility: missing `aria-label` on an icon-only control, stripped/removed focus ring (`outline: none` / `:focus { box-shadow: none }` with no replacement), input with no associated label, color-only status meaning, non-Canvas component library in use (the UI is not Canvas at all).
- **P1 — Clearly off-brand.** Off-brand color (a hue with no Canvas token), emoji used as a UI icon, non-Canvas icon set (Font Awesome, Material Icons, Lucide, Heroicons), raw hex/rgb where a semantic token exists, input not wrapped in `FormField`.
- **P2 — Non-token values.** Hard-coded `px`/`rem` spacing or `border-radius` that should snap to `system.space.*` / `system.shape.*`; wrong radius (e.g. square button instead of pill; 10px card radius instead of `shape.x2`).
- **P3 — Polish / consistency.** Inline `style={{…}}` where a `cs` prop + token belongs; deprecated Canvas APIs (`@workday/canvas-kit-react/tokens`, deprecated `Switch`/`StatusIndicator`/class `RadioGroup`/`AccentIcon`, Box style-prop spacing like `padding="m"`); logical-property opportunities (`marginLeft` -> `marginInlineStart`) for RTL.

## Checks (what to flag)

**Color & brand**
- Off-brand color — any hex/`rgb()`/`hsl()`/named color with no near Canvas token (e.g. `#7b2ff7`, `purple`, Tailwind `bg-indigo-500`). **P1** (P0 if it is a brand/primary action color that misrepresents the product).
- Raw hex/px where a token exists — e.g. `#0875e1`, `#fff`, `#1f262e`. **P1** (map via `/canvasmith:tokens`).
- Tailwind/utility color or spacing classes (`text-gray-700`, `p-4`, `rounded-lg`, `gap-2`). **P1/P2**.

**Spacing & shape**
- Non-token spacing — `padding/margin/gap/inset` in raw `px`/`rem` not on the 4px scale. **P2**.
- Wrong radius — `border-radius` not matching `system.shape.*`; buttons that aren't pills (`system.shape.round`); cards not `shape.x2` (8px). **P2**.

**Focus & accessibility** (see accessibility.md)
- Stripped focus ring — `outline: none`/`outline: 0` or overridden `:focus`/`:focus-visible` box-shadow with no Canvas double-ring replacement. Canvas keeps a transparent `outline` + two-layer `box-shadow` (inner inverse ring + outer `brand.common.focus-outline` / `system.color.border.primary.default`). **P0**.
- Missing focus styles on a custom interactive element (clickable `div`, custom button). **P0**.
- Input not wrapped in `FormField` — a `TextInput`/`TextArea`/`Select`/`Checkbox`/`Switch`/native `<input>` without a `FormField` + `FormField.Label` association. **P1** (P0 if there is no label at all). Note: `Select` WRAPS `FormField` (inverted); `FormField` wraps every other input.
- Missing `aria-label` — icon-only buttons (`TertiaryButton icon=…`, `ToolbarIconButton`), every `*.CloseIcon`, `Pill.IconButton`, overflow buttons, and required container labels on `Breadcrumbs` and `Pagination`. **P0**.
- Color-only meaning — status conveyed by color alone (no text/icon pairing); flag to use `StatusIndicator` with a `.Label`. **P0**.
- Async/status text not in an `AriaLiveRegion` when it should announce. **P2**.
- Non-logical properties in RTL-sensitive layout (`marginLeft`, `left`, `paddingRight`). **P3**.

**Icons**
- Emoji used as a UI icon (e.g. `⚙️`, `🗑️`, `✅` standing in for an action/status glyph). **P1** — replace with `SystemIcon` from `@workday/canvas-system-icons-web`.
- Non-Canvas icon library — `lucide-react`, `react-icons`, `@mui/icons-material`, Font Awesome, Heroicons. **P1** — replace with `@workday/canvas-system-icons-web` (UI) / `@workday/canvas-accent-icons-web` (decorative).

**Component library**
- Non-Canvas component library — imports from `@mui/material`, `@chakra-ui/react`, `react-bootstrap`, `antd`, `@radix-ui/*`, `@/components/ui/*` (shadcn), or raw styled HTML standing in for Canvas components. **P0** — the UI is not Workday-native; recommend `/canvasmith:convert`.
- Deprecated Canvas API — `@workday/canvas-kit-react/tokens` (`colors`/`space`/`borderRadius`), deprecated `Switch`/`StatusIndicator`/class `RadioGroup`/`AccentIcon`, Box style-prop spacing. **P3** — move to `@workday/canvas-kit-preview-react/*` and `@workday/canvas-tokens-web` `system.*`.

**App shell**
- Un-shelled top-level page — any file matching `app/**/page.tsx`, `pages/**/*.tsx` (excluding `_app.tsx` and `_document.tsx`), or `src/routes/**/*.tsx` whose default-exported JSX root is not `<AppShell>` **and** whose root layout / `_app` / entry file does not mount `<AppShell>` either. **P0** — the page renders outside Workday chrome. Fix: ensure the root layout wraps `{children}` in `<AppShell>` (preferred — usually means re-running `/canvasmith:init`), or wrap the offending page itself in `<AppShell>`.
- Nested AppShell — a page that renders `<AppShell>` when an ancestor (`app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`) already does. **P0** — produces double chrome. Fix: remove the inner shell so only the layout-level shell remains.

**Detection heuristic for AppShell rules:**
1. Grep the project for `from '@/components/canvasmith/app-shell'` (and alias-equivalent paths the consumer may use).
2. If a hit appears in `app/providers.tsx`, `pages/_app.tsx`, `src/main.tsx`, or `src/index.tsx`, the layout shells globally. Flag any **page** file that also imports `AppShell` (nested-shell P0).
3. If no hit appears in any of those entry files, every page is expected to import and render `<AppShell>` itself. Flag any page that does not (un-shelled P0).

## Output format (use exactly)

A single Markdown table, sorted P0 -> P3 then by file:

```
## Canvas audit — <target>

| Severity | Location | Issue | Fix |
|---|---|---|---|
| P0 | src/Toolbar.tsx:42 | Icon-only button has no accessible name | Add `aria-label="Settings"` to the `TertiaryButton` |
| P0 | src/Card.css:17 | Focus ring stripped (`outline: none`) | Remove it; let the Canvas component render its double focus ring, or restore the transparent `outline` + 2-layer box-shadow |
| P0 | src/SignupForm.tsx:30 | `<TextInput>` is not wrapped in a labeled `FormField` | Wrap in `<FormField><FormField.Label>…</FormField.Label><FormField.Input as={TextInput}/></FormField>` |
| P1 | src/Badge.tsx:8 | Off-brand color `#7b2ff7` (no Canvas token) | Replace with a semantic token, e.g. `cssVar(system.color.bg.primary.default)`; if intentional accent, theme via `brand.*` |
| P1 | src/Nav.tsx:5 | Emoji `⚙️` used as a settings icon | Use `<SystemIcon icon={gearIcon} />` from `@workday/canvas-system-icons-web` |
| P1 | src/Header.tsx:3 | Imports `lucide-react` icons | Swap to `@workday/canvas-system-icons-web` |
| P2 | src/Panel.tsx:22 | `padding: '20px'` is off the 4px scale | Use `cssVar(system.space.x5)` (20px) — run `/canvasmith:tokens` |
| P2 | src/Button.tsx:14 | `borderRadius: '6px'` on a button | Buttons are pills — use `cssVar(system.shape.round)` |
| P3 | src/List.tsx:9 | `marginLeft` breaks under RTL | Use `marginInlineStart` |

**Summary:** P0 ×3 · P1 ×3 · P2 ×2 · P3 ×1
**Recommended next:** `/canvasmith:tokens` to map raw values, then `/canvasmith:convert` to replace non-Canvas components.
```

Rules for the table:
- **Location** is always `file:line` (relative path). If a finding spans a range, use the first line.
- **Issue** is one terse clause naming the specific value or symbol.
- **Fix** is concrete and copy-pasteable — name the exact token, prop, component, or import, and the skill that applies it.
- Never report a finding without a fix. If the codebase is clean, say so explicitly ("No P0–P2 issues found").

## DO / DON'T

- DO check accessibility (focus, labels, FormField, aria) as P0 — it is the highest-value part of "Workday-native".
- DO ground each token/color/spacing claim in `tokens.md` and each a11y claim in `accessibility.md`; cite exact token paths in fixes.
- DO point to the right follow-up skill (`/canvasmith:tokens`, `/canvasmith:convert`) instead of fixing in place.
- DON'T auto-edit files — this skill only reports.
- DON'T flag `0`, `1px` hairlines, `100%`, `auto`, or animation timings as non-token spacing.
- DON'T invent severities or token paths; use the rubric and the verified references.
