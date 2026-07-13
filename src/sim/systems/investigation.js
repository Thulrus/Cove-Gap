// Each tick there's a chance to discover a new, not-yet-discovered zone whose
// requirements are currently met. Adding a new zone (with its own discovery
// requirements) needs no engine change.

import { chance, pick } from "../core/rng.js";
import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";
import { addDoom, ZONE_DISCOVERY_DOOM_PER_DANGER } from "./doom.js";

const DISCOVERY_CHANCE_PER_TICK = 0.15;

export function runInvestigationSystem(state, registry) {
  const log = [];
  if (!chance(state.rng, DISCOVERY_CHANCE_PER_TICK)) return { log };

  const ctx = { state, registry };
  const candidates = registry
    .allOfType("zone")
    .filter((zone) => !state.discoveredZones.includes(zone.id) && evaluateRequirement(zone.requirements, ctx));

  if (candidates.length === 0) return { log };

  const zone = pick(state.rng, candidates);
  state.discoveredZones.push(zone.id);
  addDoom(state, (zone.dangerLevel ?? 1) * ZONE_DISCOVERY_DOOM_PER_DANGER);
  log.push(
    createLogEntry("investigation", "zone_discovered", `Your scouts discover ${zone.name}.`, { zoneId: zone.id })
  );
  return { log };
}
