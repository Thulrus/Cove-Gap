// Reveals a signature entity's evidence gradually as doom rises while its
// zone is discovered — tracks aren't a big reveal, they're a flag the game
// flips so gated codex/lore entries can unlock (see systems/lore.js). This
// system never adds a monster to a raid pool itself; that's a `doomAtLeast`
// or `flag` requirement on the zone's own `monsters[]` entry (see
// zones/widowsRidge.js), evaluated by systems/events.js. New signature
// entities need no engine change: just an `omenTrack` on the monster and
// matching lore `requirements: { type: "flag", ... }` entries.

import { createLogEntry } from "../core/log.js";

function monsterZoneIsDiscovered(state, registry, monsterId) {
  return registry
    .allOfType("zone")
    .some(
      (zone) => state.discoveredZones.includes(zone.id) && (zone.monsters ?? []).some((ref) => ref.id === monsterId)
    );
}

export function runOmenSystem(state, registry) {
  const log = [];

  for (const monster of registry.allOfType("monster")) {
    if (!monster.omenTrack?.length) continue;
    if (!monsterZoneIsDiscovered(state, registry, monster.id)) continue;

    for (const step of monster.omenTrack) {
      if (state.flags[step.flag]) continue;
      if (state.doom < step.doomThreshold) continue;
      state.flags[step.flag] = true;
      log.push(
        createLogEntry("omens", "omen_revealed", "Something has left a sign of itself.", {
          monsterId: monster.id,
          flag: step.flag,
        })
      );
    }
  }

  return { log };
}
