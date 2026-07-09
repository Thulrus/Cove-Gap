# Cove Gap

**[▶ Play Cove Gap](https://thulrus.github.io/Cove-Gap/)**

An incremental/idle roguelike that runs entirely in the browser — no account,
no server, no install. Set in a small town in Eastern Kentucky in the early
1800s, where some strange things have been happening.

## About the game

You're managing a frontier settlement: gather resources, craft equipment,
defend the town, and send folks out to investigate the surrounding zones —
all while a simulation ticks along in the background, even while the tab is
closed. Progress continues offline and is caught back up the next time you
open the page, using the same deterministic tick logic as the live game.

Core loop:

- **Resources & production** — gather wood, iron, food, and other raw
  materials.
- **Crafting** — turn raw resources into items and gear (e.g. smelting iron
  ingots) via recipes with requirements.
- **Defense & combat** — build defenses like the palisade wall and fend off
  monsters such as the Hollow Stalker.
- **Exploration & zones** — discover new areas (Pinewood Hollow, Widow Creek,
  and beyond), each with its own danger level and inhabitants.
- **Quests & lore** — story beats like *The Stranger at the Treeline* unlock
  new areas, items, and codex entries that build out the setting.
- **Save/load** — export and import your run as a save file at any time.

The game is data-driven: monsters, items, recipes, zones, quests, and lore
are all defined as plain content objects (see `src/content/`) and interpreted
by a small simulation core (`src/sim/`), which keeps game logic and game
content cleanly separated.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/) for the UI and
  build tooling
- Plain JS simulation core with no framework dependencies, so it can be
  tested and run headlessly (see `scripts/smoke-test.mjs`)
- [Oxlint](https://oxc.rs/) for linting
- [Playwright](https://playwright.dev/) for responsive/browser checks (see
  `scripts/responsive-check.mjs`)

## Project layout

```
src/
  content/   Game data: items, monsters, recipes, quests, zones, lore, defenses
  sim/       Simulation core: tick loop, state, save/load, offline catch-up,
             and gameplay systems (combat, crafting, production, events, ...)
  ui/        React components and hooks that render sim state
scripts/     Dev tooling: headless smoke test, responsive/browser check
```

## Development

```bash
npm install     # install dependencies
npm run dev     # start the Vite dev server
npm run build   # production build (output in dist/)
npm run preview # preview a production build locally
npm run lint    # run Oxlint
```

To exercise the simulation headlessly without a browser:

```bash
node scripts/smoke-test.mjs
```

## Deployment

Pushes to the main development branch build the app with Vite and deploy the
`dist/` output to [GitHub Pages](https://thulrus.github.io/Cove-Gap/) via
GitHub Actions (see `.github/workflows/deploy-pages.yml`).
