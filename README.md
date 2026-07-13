# Cove Gap

**[▶ Play Cove Gap](https://thulrus.github.io/Cove-Gap/)**

## The world

Eastern Kentucky, early 1800s. A congregation called **the Brotherhood of
Light** left the settled world behind to build a righteous life somewhere no
one would interfere with how they worshipped and governed themselves. They
found a cove — a bowl of flat, fertile bottomland ringed by defensible ridges
— centered on a clearing with a massive tree and a spring-fed pond. It looked
like a sign from God. They built their town there.

It wasn't empty land. It was just old, and patient, and hadn't had a reason
to notice anyone yet.

The forest around Cove Gap isn't haunted by ghosts or ruled by devils — it's
*occupied* by something closer to the land itself occasionally waking up
enough, in one place, to act like a god for a while. These presences don't
hate the town. They don't hate anything. They're vastly old expressions of
elemental truths — Hunger, Rot, Growth, Water, Stone — and the town is, to
them, a very new and very small thing that happens to be in the way. Nothing here can be bargained with, appeased in
the usual sense, or defeated for good. It can only be *survived*, for a
while.

The Brotherhood's faith isn't wrong, exactly, and it isn't right either —
some of their rites and wards actually work, mechanically, while
fundamentally misunderstanding what they're warding against. That tension —
right practice, wrong theology — runs through the whole game.

**The town is going to fall. That's not a failure state — it's the premise.**
The only question the game asks is: *how long can you make it last, and what
do you learn about the dark before it does?*

See [`cove-gap-lore-introduction.md`](cove-gap-lore-introduction.md) for the
full mythos outline and tone guide, and
[`cove-gap-design-roadmap.md`](cove-gap-design-roadmap.md) for how that lore
is meant to translate into content and systems.

## About the game

Cove Gap is an incremental/idle roguelike that runs entirely in the browser —
no account, no server, no install.

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

Every run ends the same way — the town falls — but randomization in what
threatens it, in what order, and what the town discovers along the way means
no two runs get there the same way. See the roadmap doc for how that's meant
to work.

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
