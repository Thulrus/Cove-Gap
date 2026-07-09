// Upkeep/erosion: every built defense structure costs resources each tick.
// If upkeep can't be paid, that structure's defense value erodes instead of
// silently going into debt. Town-wide defense total feeds the combat system.

import { createLogEntry } from "../core/log.js";

export function runDefenseSystem(state, registry) {
  const log = [];
  let totalDefense = 0;

  for (const defenseId of state.builtDefenses) {
    const defense = registry.getById("defense", defenseId);
    let effectiveValue = defense.defenseValue;

    for (const cost of defense.upkeep ?? []) {
      const have = state.resources[cost.ref.id] ?? 0;
      if (have >= cost.amount) {
        state.resources[cost.ref.id] = have - cost.amount;
        continue;
      }
      const resource = registry.getById("resource", cost.ref.id);
      const shortfall = cost.amount - have;
      state.resources[cost.ref.id] = 0;
      effectiveValue = Math.max(0, effectiveValue - shortfall);
      log.push(
        createLogEntry(
          "defense",
          "upkeep_shortfall",
          `${defense.name} falls into disrepair: not enough ${resource.name} for upkeep.`,
          { defenseId, resourceId: cost.ref.id, shortfall }
        )
      );
    }

    totalDefense += effectiveValue;
  }

  state.town.defense = totalDefense;
  return { log };
}
