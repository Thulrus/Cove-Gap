import { contentByType } from "../src/content/index.js";
import { createRegistry, createInitialRunState, tick, exportRunState, importRunState } from "../src/sim/index.js";
import { startCraft } from "../src/sim/systems/crafting.js";

const registry = createRegistry(contentByType);
console.log("Loaded content types:", [...registry.byType.keys()]);
for (const type of registry.byType.keys()) {
  console.log(`  ${type}: ${registry.allOfType(type).map((e) => e.id).join(", ")}`);
}

const state = createInitialRunState("test-seed-123", registry);
console.log("\nInitial resources:", state.resources);
console.log("Initial inventory:", state.inventory);

const craftResult = startCraft(state, registry, "smelt_iron_ingot");
console.log("\nstartCraft ->", craftResult.success, craftResult.log.map((l) => l.message));

for (let i = 0; i < 40 && state.alive; i++) {
  const { log } = tick(state, registry);
  for (const entry of log) console.log(`[tick ${state.tick}] (${entry.system}) ${entry.message}`);
}

console.log("\nFinal resources:", state.resources);
console.log("Final inventory:", state.inventory);
console.log("Discovered zones:", state.discoveredZones);
console.log("Completed quests:", state.completedQuests);
console.log("Town:", state.town, "alive:", state.alive);

const exported = exportRunState(state);
const reimported = importRunState(exported);
console.log("\nRound-trip save OK:", reimported.tick === state.tick && reimported.seed === state.seed);
