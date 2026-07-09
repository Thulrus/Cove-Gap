// The single authoritative tick. Calls each per-loop system in a fixed
// order, collects their logs, and appends to the run's activity feed. This
// is the only function that advances sim time — the live UI loop and the
// headless offline catch-up loop both just call this repeatedly.

import { runProductionSystem } from "../systems/production.js";
import { runInvestigationSystem } from "../systems/investigation.js";
import { runCraftingSystem } from "../systems/crafting.js";
import { runDefenseSystem } from "../systems/defense.js";
import { runEventsSystem } from "../systems/events.js";
import { runCombatSystem } from "../systems/combat.js";
import { runQuestSystem } from "../systems/quests.js";
import { appendActivityLog } from "./log.js";

// The six systems below run in this fixed order per the sim design. Quest
// progression is checked afterward — see systems/quests.js for why it isn't
// one of the six.
const SYSTEMS_IN_ORDER = [
  runProductionSystem,
  runInvestigationSystem,
  runCraftingSystem,
  runDefenseSystem,
  runEventsSystem,
  runCombatSystem,
  runQuestSystem,
];

/**
 * Mutates `state` in place and returns this tick's combined log.
 * No-ops (returns an empty log) once the run has ended.
 */
export function tick(state, registry) {
  if (!state.alive) return { log: [] };

  const tickLog = [];
  for (const system of SYSTEMS_IN_ORDER) {
    const result = system(state, registry);
    tickLog.push(...(result?.log ?? []));
    if (!state.alive) break; // town fell mid-tick; remaining systems skip
  }

  state.tick += 1;
  state.lastTickAt = Date.now();
  appendActivityLog(state, tickLog);
  return { log: tickLog };
}
