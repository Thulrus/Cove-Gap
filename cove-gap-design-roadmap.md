# Cove Gap — Design Roadmap: Lore → Mechanics

This document picks up where
[`cove-gap-lore-introduction.md`](cove-gap-lore-introduction.md) leaves off.
That doc answers "what is this world and what tone does it have." This doc
answers "what does that actually mean for content and code" — how the
Aspects, the indifference, the faith-as-partial-ward idea, and the
"the town *will* fall" premise turn into content schemas, sim systems, and a
randomization strategy, so we can start building specific pieces instead of
talking about the world in the abstract.

It's written against the game as it exists today (`src/content/`,
`src/sim/`), not a hypothetical rewrite. Where something needs to change in
the engine, that's called out explicitly as a gap.

## 1. The premise, made mechanical

> The town is going to fall. The only question is how long, and what you
> learn before it does.

Today, decline is already modeled, just not yet dressed in lore or given a
real curve:

- `state.town.health` / `state.town.defense` — `src/sim/core/state.js:54`
- Raids fire at a **flat 5% chance every tick**, forever, regardless of how
  long the run has gone or what the player has done —
  `src/sim/systems/events.js:9`
- A raid picks a random discovered zone, then a random monster from that
  zone's pool, and resolves as flat `attack - defense (+/- 2 variance)` —
  `src/sim/systems/combat.js`
- `resolveDeath` / `computeScore` already exist as hooks for a death-summary
  screen, currently placeholders — `src/sim/core/score.js`

That's a fine skeleton, but a flat 5%/tick hazard rate doesn't express
"ancient things noticing you more as you make noise," and it gives the
player no legible sense of *why* the town fell when it did. The core design
addition this roadmap proposes is a **Doom / Awareness pressure system**:
a number (or small vector) that tracks how much the Dark Green has "noticed"
the town, which raises the raid chance and unlocks scarier raid pools over
time — instead of a flat coin flip from tick 1.

This is the single most important system to build, because it's the thing
that makes the lore's central idea ("indifference, not malice — but scale")
legible as gameplay instead of just flavor text sitting next to a random
number generator.

### Proposed: Awareness/Doom system

- New run-state field: `state.doom` (0–100, or per-Aspect if we want
  regional pressure — see §3).
- Doom rises from:
  - **Time** — a small baseline drift per tick (the world doesn't need a
    reason).
  - **Disturbance** — discovering a new zone, exploring a high-danger zone,
    certain quest stages, certain crafting/resource actions (e.g. clearing
    old growth, digging where you shouldn't) bump doom directly. This is
    the mechanical expression of "you made a sound and it was in range."
  - **Failed rites** — see §2.3.
- Doom *lowers* slowly, or is capped from certain player actions (wards,
  completing certain quests, *not* pushing into certain zones) — never
  reset to zero. The tension is management, not elimination.
- `RAID_CHANCE_PER_TICK` in `events.js` becomes a function of doom
  (`baseChance + doom * scalingFactor`) instead of a constant.
- Raid *monster pool* also gates on doom: low-doom runs only ever surface
  the small, mundane threats (burrow grubs, hollow stalkers); only once
  doom crosses thresholds do zone monster pools include an Aspect's named
  entity. This gives runs a shape — quiet early game, tightening middle,
  a named entity showing up as the beginning of the end — without hardcoding
  a script.
- Death summary (`computeScore`) reports which Aspect ultimately ended the
  run and the doom trajectory, so "how did we die this time" is a real
  narrative, not just a tick count.

This is additive to the existing tick/log architecture — no rewrite, one new
piece of run state and one new small system (`src/sim/systems/doom.js`),
plus a read in `events.js`.

## 2. Aspects, made mechanical

The lore doc defines five Aspects (Hunger, Rot/Return, Growth/Root,
Water/Hollow, Stone/Watch) and says 4–6 well-developed entities carry the
whole game. Mechanically, an Aspect should be a **content tag that changes
how systems read an entity**, not just flavor text on a monster.

### 2.1 Aspect as a first-class tag, not a new schema

Don't invent a separate "Aspect" content type. Add `aspect` as a recognized
tag/field on monsters, zones, and lore entries (extending the existing
`tags: []` convention already used everywhere), plus a small
`src/content/aspects/` index that documents each Aspect's identity, mechanical
signature, and doom-threshold behavior. Concretely:

```js
// src/content/aspects/hunger.js
export const hunger = {
  id: "hunger",
  type: "aspect",
  name: "Hunger",
  description: "Consumption without malice — an appetite older than ethics.",
  signature: {
    // what fighting/encountering a Hunger-aspected thing tends to feel like
    combatBias: { attack: "high", defense: "low" }, // hits hard, dies easier once truly engaged
    resourceDrain: ["food", "livestock"], // what it costs the town passively before any raid
  },
};
```

Each monster/zone that belongs to an Aspect references it by id
(`aspectRef: { id: "hunger" }`), the same `ref` pattern already used for
zone→monster and quest→item links (`src/sim/content/refs.js`). This means:

- Combat, production, and event systems can ask "does this raid belong to an
  Aspect with a resource-drain signature?" and apply passive effects (e.g.
  Hunger-aspected presence in a discovered zone slowly reduces food yield,
  independent of raids) without special-casing individual monsters.
- Weaknesses (already supported per-monster via `weaknesses: [{tag: "iron"}]`
  in `hollowStalker.js`) can be partially inherited from Aspect (e.g. "most
  Water/Hollow things are warded by salt or fire" as an Aspect-level default,
  with individual entities overriding).

### 2.2 The signature entity as "weather system," mechanically

The lore explicitly frames the Hollow Boar as a weather system, not a boss:
it has a range, sightings are omens, the encounter is earned rather than
scripted. Mechanically this maps onto the existing zone/investigation loop
almost directly:

- A signature entity is **not** placed directly in a zone's `monsters: []`
  raid pool at low doom. Instead it has an **omen track**: as doom rises (or
  as the player spends time in its zone), *evidence* lore/codex entries
  unlock (using the existing `lore` schema + `requirements: {type: "flag"}`
  pattern already used by `oldMillersWarning.js`) — tracks, a wrecked root
  cellar, a silent quarter-mile.
- Only after N evidence entries (or a doom threshold) does the entity enter
  the zone's actual raid pool. This is a `requirements` gate on a
  `monsters: []` entry, which needs a small extension: today
  `zone.monsters` is a flat array of refs (`widowCreek.js:8`); it should
  support an optional `requirements` per pool entry, evaluated the same way
  `evaluateRequirement` already gates zone discovery
  (`src/sim/systems/investigation.js:18`).

### 2.3 Faith as a real, limited tool

The lore's key nuance: some Brotherhood rites *actually work*, mechanically,
while misunderstanding the theology. This needs its own small content type,
distinct from items:

```js
// src/content/rites/saltTheThreshold.js
export const saltTheThreshold = {
  id: "salt_the_threshold",
  type: "rite",
  name: "Salting the Threshold",
  description: "The Brotherhood salts the doorframes each new moon.",
  requirements: { /* resource cost, e.g. salt + a worker-tick */ },
  effect: { aspectRef: { id: "water_hollow" }, doomDelta: -X, defenseDelta: +Y },
  misunderstanding: "Believed to ward off wandering spirits of the drowned dead.",
};
```

- Rites cost resources/worker-time (via the existing recipe/requirement
  machinery) and produce a real mechanical effect (lower doom against one
  Aspect, or a flat defense bonus vs. one Aspect's raids) — but the effect is
  *partial and Aspect-specific*, never a general "safe now" button. A rite
  aimed at the wrong Aspect does nothing, which is itself a discovery the
  player has to make (mirrors "right practice, wrong theology").
- A failed/irrelevant rite attempt is a good **doom-raising** trigger from
  §1 — misapplied faith can make things worse, which is thematically sharp
  (you did a ritual that was never for this thing, and it noticed the
  disturbance).

## 3. What player actions actually do (causal map)

Concretely, once the above lands, every action should sit somewhere on this
chain: **action → resource/doom/evidence delta → downstream raid pool /
zone / rite behavior.** Sketch of the intended causal map:

| Action | Immediate effect | Downstream effect |
|---|---|---|
| Gather/produce resources | +resources | fuels crafting & rites; over-harvesting a Growth/Root zone raises that Aspect's doom |
| Craft gear/wards | -resources, +items | items with `tags` matching a monster's `weaknesses` blunt raid damage (already implemented, `combat.js:13`) |
| Explore a new zone | chance to discover zone | raises doom slightly (disturbance); unlocks new monster pool, new lore/evidence |
| Investigate a discovered zone repeatedly | unlocks evidence/codex entries | advances a signature entity's omen track toward "enters raid pool" |
| Build defenses/facilities | +town.defense or new production | blunts flat raid damage; some defenses could be Aspect-specific (a ward wall vs. a physical palisade) |
| Perform a rite | resource cost | Aspect-specific doom reduction *if correctly targeted*; wasted/misapplied attempts raise doom |
| Do nothing / idle | baseline doom drift | the world doesn't need a reason — this is deliberate and should be visible in UI (a slow "unease" readout) so players feel time itself is the enemy, not just their own mistakes |

This table is the thing to keep referring back to when adding new content —
every new monster, zone, quest, or item should be answerable as "which row
does this sit on, and what's the delta."

## 4. Randomization & remixing strategy

The ask was: every playthrough should feel different, and the lore needs to
accommodate that. Recommendation: **hybrid, not either/or** — a small hand-
authored stable of *identity* pieces (Aspects, signature entities, zones'
core identity), combined with procedural *modifiers* that remix at the
edges. Pure procedural generation of monsters/zones from scratch would
flatten the folk-naming, evidence-before-encounter texture the lore doc
cares about; pure hand-authored content won't scale to "every run feels
different" without a huge, unsustainable content budget. The hybrid gets
both.

### 4.1 Fixed stable (hand-authored, small, high quality)

- 4–6 Aspects (already scoped in the lore doc).
- 1 signature/"weather system" entity per Aspect (6ish total), each with a
  real evidence/omen chain and a folk name.
- A slightly larger stable (10–20) of "mundane" monsters/hazards — reskins
  are fine here, these are the rank-and-file raid-pool fillers, not the
  stars.
- A handful of zone *archetypes* tied to biome + Aspect (ridge/stone,
  hollow/water, deep-woods/growth, etc.) — enough that each Aspect has a
  "home" zone type.

### 4.2 Procedural remix layer (built from core pieces, not authored per-run)

This is where "large number of combinations" comes from without an
unsustainable content budget:

- **Zone instancing**: a zone entity in content becomes a *template*
  (biome tags, base danger, base Aspect affinity, environmental modifier
  slots) rather than a fully fixed place. At run start (seeded off
  `state.seed`, which already drives `createRng` — `state.js:16`), the game
  rolls which zone templates are present this run, in what order they
  unlock, and which 1–2 environmental modifiers apply (e.g. "early frost,"
  "flooded lowland," "scorched from an old burn") — small data-driven tweaks
  to danger level / resource yield / which monster tags are more likely,
  not new hand-written prose per zone.
- **Monster variation via tag-driven modifiers**, not new monsters: a
  small set of prefix/suffix modifier objects (`{ tag: "gaunt",
  combatMods: {attack: +X}, weaknessAdd: [...] }`) that can roll onto base
  monsters at raid-generation time, seeded by the run. "Gaunt Hollow
  Stalker" vs. "Bloated Hollow Stalker" reads as different content without
  doubling the authored monster count. In-fiction text stays folk-flavored
  by writing modifier flavor text as a *fragment* ("...but this one's ribs
  show through its coat...") that composes with the base entity's
  description rather than a fully separate name — matches lore principle
  #6 (named, not classified) as long as we're careful with copy.
- **Quest/lore remixing**: keep quests mostly hand-authored (they're the
  backbone of narrative pacing), but let *codex/evidence* lore entries be
  more combinatorial — evidence text built from a small library of
  observation fragments + which Aspect/zone triggered them, so the codex
  reads freshly-observed rather than templated, without needing bespoke
  prose for every zone/Aspect pairing.
- **Doom pacing seeds**: the doom-drift rate and disturbance weights
  (§1) get a small per-run seeded variance too, so "how fast does this run
  tighten" differs — some runs are a slow bleed, some spike early from an
  unlucky roll on a Growth zone.

### 4.3 What this means for schema work

- Extend zone content objects with an optional `template: true` /
  `modifierSlots` shape, and add a small `src/content/modifiers/` stable
  plus a generation step (probably in `createInitialRunState` or a new
  `src/sim/content/generateRun.js`) that resolves templates into concrete
  per-run zone/monster instances, seeded.
- This is the biggest engine-level lift in this roadmap — everything else
  (Aspects, doom, rites) is additive content + one small system each; this
  one touches run generation. Worth prototyping small (e.g. just monster
  modifiers first) before committing to full zone templating.

## 5. Roadmap phases

Ordered so each phase is playable/testable on its own, and later phases
build on earlier ones.

**Phase 0 — Narrative foundation (docs, no code)**
- [x] Lore introduction doc
- [x] README rewritten as world intro + outline
- [x] This roadmap

**Phase 1 — Doom/Awareness system (small, high-impact)** ✅ done

- [x] Add `state.doom`/`peakDoom`, replace flat `RAID_CHANCE_PER_TICK` with a
  doom-scaled function (`raidChanceForDoom`) in `src/sim/systems/doom.js`,
  read from `events.js`.
- [x] Wire zone discovery to bump doom (scaled by zone danger level) in
  `investigation.js`. Mission-based doom bumps not yet wired — still open.
- [x] Surface doom in the UI as ambient tier text ("unease") in
  `DashboardStrip`, never a raw number.
- [x] `computeScore`/death summary reports peak doom tier reached.

**Phase 2 — Aspects as a real tag** ✅ done

- [x] Authored `src/content/aspects/` (Hunger, Rot/Return, Growth/Root,
  Water/Hollow, Stone/Watch) as a first-class content type (schema +
  registry support added).
- [x] Tagged existing monsters/zones (`hollowStalker` → water_hollow,
  `burrowGrub` → growth_root, `widowCreek` → water_hollow, `pinewoodHollow`
  → growth_root) with `aspectRef` — retrofit before
  adding new content.
- Add Aspect-aware passive effects (resource drain from an aspected zone
  presence) as a small new system or an extension of `production.js`.

**Phase 3 — Signature entities & the omen/evidence chain** ✅ done (Hunger)

- [x] Built Hunger's full chain end-to-end: `hollow_boar` ("the Sow of
  Widow's Ridge") has an `omenTrack` (`src/sim/systems/omens.js`) that flips
  flags as doom rises; three evidence lore entries (`boarSignOne/Two/Three`)
  unlock off those flags; a new zone (`widows_ridge`, gated behind
  `widow_creek`) only makes the boar raid-eligible once the third flag is
  set.
- [x] Extended zone `monsters: []` entries to support per-entry
  `requirements`, evaluated in `events.js` before a raid can pick that
  entity.
- [x] Added plumbing this depended on that didn't exist yet: a `lore`
  discovery system (`src/sim/systems/lore.js`, `state.discoveredLore`) and a
  minimal Codex tab (`CodexPanel.jsx`) — lore content had no reader before
  this phase.
- [ ] Phase 3b (repeat for Rot/Return, Growth/Root's own signature entity,
  Water/Hollow, Stone/Watch) — not started.
- **Balance note for later tuning**: Hunger's zone (`widows_ridge`) and
  Growth/Root's zone (`pinewood_hollow`) both drain the `food` resource,
  which stacks fast once both are discovered (~0.7/tick against a starting
  pool of 20) — fine for proving the system works, but worth diversifying
  drain targets across Aspects before balancing real runs.

**Phase 4 — Rites & the faith-as-partial-ward loop** ✅ done (system + 1 rite)

- [x] New `rite` content type (`cost`, `effect.aspectRef`/`doomDelta`,
  `misunderstanding`) plus `performRite()` intent handler in
  `src/sim/systems/rites.js` — same player-intent shape as
  `startCraft`/`startBuild`, no queue, resolves immediately.
- [x] A rite only lowers doom if its *actually*-warded Aspect has a
  presence in a discovered zone right now; otherwise it's a misfire that
  raises doom instead (`RITE_MISFIRE_DOOM`) — the mechanical form of "right
  practice, wrong theology" and "guessing wrong is discoverable, not told."
- [x] Authored one rite (`salt_the_threshold`, targets `water_hollow`,
  Brotherhood believes it wards off "wandering spirits of the drowned
  dead") to prove the system; wired a minimal `RitesPanel` (Codex tab) and
  the `performRite` intent through `useSimRun`.
- [ ] One rite per remaining Aspect — deferred alongside Phase 3b entity
  work, since both are now the same kind of task: fill out the stable using
  systems that already work.
- **Effect scope note**: only `doomDelta` is implemented; the roadmap's
  original sketch also mentioned a `defenseDelta`. Left out for now to avoid
  inventing a second mechanic (a temporary "ward" buffer) before we have a
  concrete need for it — revisit once a specific Aspect's rite calls for a
  defensive rather than doom-reducing effect.

**Phase 5 — Procedural remix layer** 🟡 started (monster modifiers only)

- [x] Monster tag-modifiers (§4.2): new `modifier` content type
  (`attackMod`, optional `weaknessAdd`, `descriptionFragment`) in
  `src/content/modifiers/` (Gaunt, Bloated, Scarred). `events.js` rolls one
  onto a monster at raid time (30% chance) and stores `modifierId` on
  `state.pendingCombat`; `combat.js` resolves damage/weaknesses/display name
  through it. A shared `src/sim/content/monsterInstance.js` composes base
  monster + modifier so events.js's announcement and combat.js's resolution
  always agree on name/attack/weaknesses.
- [x] Monsters tagged `"ancient"` (i.e. signature entities like
  `hollow_boar`) are excluded from modifier rolls — verified directly
  (0/44 forced boar raids got a modifier) — the remix layer is for
  rank-and-file fillers, not the stars, per §4.1.
- [ ] Zone templating (§4.3) — not started. This is still flagged as the
  biggest engine-level lift in this roadmap (touches run generation, not
  just one system) and is deliberately deferred until modifiers have been
  played with.
- [ ] Seeded codex/evidence fragment composition — not started; natural
  next step once there's more than one Aspect's worth of evidence lore to
  draw fragments from (see Phase 3b).
- [ ] Doom pacing seed variance — not started.

**Phase 6 — Content scale-out**
- Once the systems above are proven, this becomes mostly content
  authoring: fill out the remaining Aspects, zone archetypes, mundane
  monster stable, quest chains — the "large stable" part of the original
  ask, now built on load-bearing systems instead of one-off entities.

## 6. Open questions to resolve before/during Phase 1–2

- Should doom be a single global number, or per-Aspect (regional pressure)?
  Per-Aspect is more expressive (mirrors "the Boar's range" framing) but
  adds UI/balance complexity. Recommend starting global for Phase 1, and
  revisiting per-Aspect once Phase 2/3 make Aspects a real gameplay object.
- How much should the player be told, numerically? The lore's "evidence
  before encounter" principle argues against a visible doom meter at all —
  probably an ambient-text tier system (calm → uneasy → dread → the dark is
  close) rather than a number, even in Phase 1.
- Rite targeting: does the player have to *guess* which Aspect a rite wards
  against (discovery-driven, riskier, more in-fiction), or is it labeled
  outright (clearer, more mechanical)? Leaning toward: labeled in the
  Brotherhood's own (wrong) terms, with the *actual* Aspect it wards
  revealed only through play/codex — so the mechanical effect is honest but
  the fictional framing preserves the "right practice, wrong theology"
  tension.
