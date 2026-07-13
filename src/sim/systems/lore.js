// Lore/codex discovery: mirrors zone discovery, but for `lore` entries. A
// lore entry unlocks into `state.discoveredLore` the first tick its
// `requirements` evaluate true (a flag, an item, a zone — whatever it's
// gated on). Runs last in the tick so it can see flags set earlier the same
// tick (quests, omens). New lore entries are pure data; nothing here
// references a specific lore id.

import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";

export function runLoreSystem(state, registry) {
  const log = [];
  const ctx = { state, registry };

  for (const entry of registry.allOfType("lore")) {
    if (state.discoveredLore.includes(entry.id)) continue;
    if (!evaluateRequirement(entry.requirements, ctx)) continue;

    state.discoveredLore.push(entry.id);
    log.push(
      createLogEntry("lore", "lore_discovered", `New codex entry: ${entry.name}.`, { loreId: entry.id })
    );
  }

  return { log };
}
