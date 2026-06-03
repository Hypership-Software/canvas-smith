# Canvasmith

**Make it look like Workday built it.**

Canvasmith is a [Claude Code](https://claude.com/claude-code) plugin that grounds every front-end your agent builds in **real Workday Canvas Kit** — actual `@workday/canvas-kit-react` components, `createStencil` patterns, and Canvas Design Tokens. No more generic AI dashboards: ship UI that looks and behaves like it came from Workday's own design team, not a template.

This repository is a [Turborepo](https://turbo.build/repo) monorepo containing the plugin, its marketing site, and the Canvas-themed component registry.

→ **[canvasmith.dev](https://canvasmith.dev)**

---

## Install (in Claude Code)

```text
/plugin marketplace add Hypership-Software/canvas-smith
/plugin install canvasmith@canvasmith
```

The first line registers this repository as a plugin marketplace; the second installs the `canvasmith` plugin from it. Skills are then invoked namespaced, e.g. `/canvasmith:init`. The flagship `canvas-ui` skill is auto-invoked — just ask Claude to build or restyle a UI.

---

## Monorepo layout

```text
canvasmith/
├─ apps/
│  └─ web/                  # Marketing site — Next.js 15 (App Router), canvasmith.dev
├─ packages/
│  ├─ canvasmith/           # The Claude Code plugin (skills, commands, references)
│  └─ ui/                   # Canvas-themed component registry (shadcn-style, added in the registry step)
├─ .claude-plugin/
│  └─ marketplace.json      # Marketplace catalog (resolved at repo root by Claude Code)
├─ turbo.json               # Turborepo task pipeline
└─ pnpm-workspace.yaml      # Workspaces: apps/* and packages/*
```

| Workspace | What it is |
| --- | --- |
| **`apps/web`** | The Canvasmith marketing site — a Next.js 15 single-page app. Also hosts the docs and the ZIP-bundle download fallback. |
| **`packages/canvasmith`** | The Claude Code plugin itself: the auto-invoked `canvas-ui` flagship skill plus the user-invokable commands (`init`, `build`, `add`, `convert`, `tokens`, `component`, `audit`, `docs`). |
| **`packages/ui`** | The Canvas-themed component registry — a shadcn-style set of vetted Workday blocks, **added in the registry step** and consumed via `/canvasmith:add`. |

---

## Local development

Requires [pnpm](https://pnpm.io) 9+ and Node 18.18+.

```bash
pnpm install          # install all workspace dependencies
pnpm dev              # run every workspace's dev task via Turborepo
pnpm web              # run only the marketing site (turbo --filter=web)
```

Other Turborepo tasks:

```bash
pnpm build            # turbo run build   — build every workspace
pnpm lint             # turbo run lint
pnpm typecheck        # turbo run typecheck
pnpm format           # prettier across the repo
```

The marketing site uses the real, pinned Canvas Kit packages so the live before/after demo is genuine:

```text
@workday/canvas-kit-react@15.0.6
@workday/canvas-kit-styling@15.0.6
@workday/canvas-kit-preview-react@15.0.6
@workday/canvas-tokens-web@4.3.0
@workday/canvas-system-icons-web@4.0.4
@workday/canvas-kit-react-fonts
```

---

## Documentation

- **Plugin README:** [`packages/canvasmith/README.md`](packages/canvasmith/README.md) — the full command reference and how the plugin works.
- **Website:** [canvasmith.dev](https://canvasmith.dev)

---

## License

[MIT](LICENSE) © 2026 Kyle (Hypership).

Canvasmith is an independent, unofficial project. Not affiliated with or endorsed by Workday, Inc. Workday and Canvas are trademarks of Workday, Inc. Built on the open-source [`@workday/canvas-kit`](https://github.com/Workday/canvas-kit).
