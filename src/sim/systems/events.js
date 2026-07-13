// Raid triggers: each tick there's a chance a monster emerges from a
// discovered zone's spawn pool. New zones/monsters just add to the pool this
// system draws from; no engine change needed.

import { chance, pick } from "../core/rng.js";
import { createLogEntry } from "../core/log.js";
import { resolveRefEntities } from "../content/refs.js";
import { raidChanceForDoom } from "./doom.js";

export function runEventsSystem(state, registry) {
  const log = [];
  if (state.pendingCombat) return { log }; // already resolving a prior raid
  if (!chance(state.rng, raidChanceForDoom(state.doom))) return { log };

  const candidateZones = registry
    .allOfType("zone")
    .filter((zone) => state.discoveredZones.includes(zone.id) && (zone.monsters?.length ?? 0) > 0);
  if (candidateZones.length === 0) return { log };

  const zone = pick(state.rng, candidateZones);
  const monsterRef = pick(state.rng, zone.monsters);
  const monsters = resolveRefEntities(registry, "monster", monsterRef);
  if (monsters.length === 0) return { log };
  const monster = pick(state.rng, monsters);

  state.pendingCombat = { monsterId: monster.id, zoneId: zone.id };
  log.push(
    createLogEntry("events", "raid_triggered", `${monster.name} emerges from ${zone.name}!`, {
      monsterId: monster.id,
      zoneId: zone.id,
    })
  );
  return { log };
}
