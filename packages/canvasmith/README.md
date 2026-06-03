# Canvasmith

**Make it look like Workday built it.** Canvasmith is a Claude Code plugin that grounds any AI-generated front-end in real Workday Canvas Kit — actual `@workday/canvas-kit-react` components, `createStencil` patterns, and `cssVar(system.*)` design tokens — so the UI your agent ships is indistinguishable from a native Workday product.

---

## Install

In Claude Code, run:

```text
/plugin marketplace add Hypership-Software/canvas-smith
/plugin install canvasmith@canvasmith
```

That's it. The flagship `canvas-ui` skill is auto-invoked — just ask Claude to build or restyle a UI and it goes Workday-native. The commands below are available namespaced as `/canvasmith:<name>`.

---

## Commands

| Command | What it does |
| --- | --- |
| **`canvas-ui`** *(flagship, auto-invoked)* | Makes any UI Workday-native. Not a slash command — Claude invokes it automatically whenever you build, restyle, or "Workday-ify" a front-end. Applies real Canvas Kit components, tokens, Roboto, and Workday styling conventions. |
| `/canvasmith:init` | Detects your stack and sets up Canvas Kit: dependencies, the four token CSS imports, Roboto fonts, `CanvasProvider`, Emotion SSR, and a `CANVAS.md` of your project conventions. |
| `/canvasmith:build <screen>` | Generates a screen from real Canvas Kit components + Canvasmith blocks + tokens — not invented CSS. |
| `/canvasmith:add <block>` | Adds a vetted Workday block from the Canvasmith registry. |
| `/canvasmith:convert` | Refactors existing AI-generated UI to Canvas Kit components and `cssVar()` tokens. |
| `/canvasmith:tokens` | Maps raw colors and spacing to the nearest Canvas token (e.g. `#0875e1` → `system.color.bg.primary.default`). |
| `/canvasmith:component` | Scaffolds a new component with `createStencil` in the Canvas idiom. |
| `/canvasmith:audit` | Flags off-brand color, non-token spacing, wrong radius, and missing focus/a11y — prioritized P0–P3. |
| `/canvasmith:docs <component>` | Pulls a Canvas Kit component's real prop table and usage into context. |

---

## What's included

- **`canvas-ui` — the flagship skill.** Auto/model-invoked. It carries Canvasmith's full knowledge of Workday Canvas and steers generation toward real components, tokens, and conventions. Its depth lives in companion reference files:
  - **tokens** — the Canvas Design Token map: real paths like `cssVar(system.color.bg.primary.default)` (resolves to `var(--cnvs-sys-color-bg-primary-default)`), the `space` scale, radii, and verified brand hex.
  - **components** — the real `@workday/canvas-kit-react` component inventory and import paths (`@workday/canvas-kit-react/button`, `…/form-field`, `…/select`, etc.) with prop tables.
  - **setup & styling** — dependency setup, the four token CSS imports, Roboto via `@workday/canvas-kit-react-fonts`, `CanvasProvider`, Emotion SSR, and the `@workday/canvas-kit-styling` API (`createStyles`, `createStencil`, `cssVar`, `px2rem`).
  - **patterns & accessibility** — Workday layout and form patterns, focus management, and contrast expectations.
- **The command set** above — `init`, `build`, `add`, `convert`, `tokens`, `component`, `audit`, `docs` — installed as user-invokable skills under `/canvasmith:*`.
- **The Canvasmith registry blocks** — vetted, Canvas-native Workday blocks added on demand via `/canvasmith:add`.

---

## How it works

1. **Ground.** `canvas-ui` loads real Canvas Kit references — components, stencils, and the live token map straight from `@workday/canvas-kit-react`. Your agent now knows what "Workday-native" actually means.
2. **Build.** Ask for any screen. Canvasmith steers generation toward real components (`PrimaryButton`, `Card`, `FormField`, `Select`…) and `cssVar(system.color.…)` tokens instead of invented CSS — pulling in registry blocks with `/canvasmith:add` where they fit.
3. **Verify.** `/canvasmith:audit` flags off-brand color, non-token spacing, raw hex, wrong radius, and missing focus states (P0–P3) — so what ships passes a Canvas design review, not just an eye test.

No Canvas Kit expertise required. You write the prompt; Canvasmith handles the Canvas.

### Pinned versions

Canvasmith targets these exact, published Canvas Kit packages (with React 18 and `@emotion/react` ^11.7):

```text
npm i @workday/canvas-kit-react@15.0.6 @workday/canvas-kit-styling@15.0.6 \
  @workday/canvas-tokens-web@4.3.0 @workday/canvas-system-icons-web@4.0.4 \
  @workday/canvas-kit-react-fonts
```

`/canvasmith:init` installs and wires these for you.

---

## License

MIT. See [LICENSE](../../LICENSE).

---

*Canvasmith is an independent, unofficial project. Not affiliated with or endorsed by Workday, Inc. Workday and Canvas are trademarks of Workday, Inc. Built on the open-source [`@workday/canvas-kit`](https://github.com/Workday/canvas-kit).*
