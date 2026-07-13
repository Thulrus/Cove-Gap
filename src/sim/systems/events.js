// Raid triggers: each tick there's a chance a monster emerges from a
// discovered zone's spawn pool. New zones/monsters just add to the pool this
// system draws from; no engine change needed.

import { chance, pick } from "../core/rng.js";
import { createLogEntry } from "../core/log.js";
import { resolveRefEntities } from "../content/refs.js";
import { evaluateRequirement } from "../content/requirements.js";
import { describeMonsterInstance } from "../content/monsterInstance.js";
import { raidChanceForDoom } from "./doom.js";

// A zone's monster pool entries can carry their own `requirements` (e.g. a
// `doomAtLeast` or `flag` gate) so a signature entity only becomes raid-
// eligible once its omen track (see systems/omens.js) has been walked —
// sightings are omens until the game decides you're ready for the encounter.
function eligibleMonsterRefs(zone, ctx) {
  return (zone.monsters ?? []).filter((ref) => evaluateRequirement(ref.requirements, ctx));
}

// Ancient/signature entities (tagged "ancient") never roll a modifier — the
// remix layer is for the rank-and-file raid-pool fillers, not the stars.
// See cove-gap-design-roadmap.md §4.2.
const MODIFIER_CHANCE = 0.3;

function rollModifier(state, registry, monster) {
  if (monster.tags?.includes("ancient")) return null;
  const modifiers = registry.allOfType("modifier");
  if (modifiers.length === 0 || !chance(state.rng, MODIFIER_CHANCE)) return null;
  return pick(state.rng, modifiers);
}

export function runEventsSystem(state, registry) {
  const log = [];
  if (state.pendingCombat) return { log }; // already resolving a prior raid
  if (!chance(state.rng, raidChanceForDoom(state.doom))) return { log };

  const ctx = { state, registry };
  const candidateZones = registry
    .allOfType("zone")
    .filter((zone) => state.discoveredZones.includes(zone.id) && eligibleMonsterRefs(zone, ctx).length > 0);
  if (candidateZones.length === 0) return { log };

  const zone = pick(state.rng, candidateZones);
  const monsterRef = pick(state.rng, eligibleMonsterRefs(zone, ctx));
  const monsters = resolveRefEntities(registry, "monster", monsterRef);
  if (monsters.length === 0) return { log };
  const monster = pick(state.rng, monsters);
  const modifier = rollModifier(state, registry, monster);

  state.pendingCombat = { monsterId: monster.id, zoneId: zone.id, modifierId: modifier?.id ?? null };
  const displayName = describeMonsterInstance(monster, modifier);
  const flavor = modifier ? ` ${modifier.descriptionFragment}` : "";
  log.push(
    createLogEntry("events", "raid_triggered", `${displayName} emerges from ${zone.name}!${flavor}`, {
      monsterId: monster.id,
      zoneId: zone.id,
      modifierId: modifier?.id ?? null,
    })
  );
  return { log };
}
