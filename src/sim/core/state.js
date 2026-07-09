// Factories for the two state trees: run state (wiped on death) and meta
// state (persists across runs). Kept as plain data so save.js can
// JSON-serialize either one directly.

import { createRng } from "./rng.js";

export const RUN_STATE_VERSION = 1;
export const META_STATE_VERSION = 1;

/**
 * @param {string} seed
 * @param {import("../content/registry.js").ContentRegistry} registry
 */
export function createInitialRunState(seed, registry) {
  const resources = {};
  for (const resource of registry.allOfType("resource")) {
    resources[resource.id] = resource.startingAmount ?? 0;
  }

  const inventory = {};
  for (const item of registry.allOfType("item")) {
    if (item.startingAmount) inventory[item.id] = item.startingAmount;
  }

  return {
    version: RUN_STATE_VERSION,
    seed,
    rng: createRng(seed),
    tick: 0,
    alive: true,

    resources,
    inventory,
    flags: {},

    discoveredZones: [],
    builtDefenses: [],
    activeQuests: [], // { questId, stageIndex }
    completedQuests: [], // questId[]
    craftingQueue: [], // { recipeId, remainingTicks }
    pendingCombat: null, // { monsterIds: string[] } while a raid is being resolved

    town: { health: 100, maxHealth: 100, defense: 0 },

    activityLog: [],
    createdAt: Date.now(),
    lastTickAt: Date.now(),
  };
}

export function createInitialMetaState() {
  return {
    version: META_STATE_VERSION,
    runsCompleted: 0,
    bestScore: 0,
    lastDeathSummary: null,
    unlockedContentIds: [],
  };
}
