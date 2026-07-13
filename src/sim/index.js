// Public sim API surface. The UI layer (/src/ui) may only import from here —
// never reach into /src/sim/core or /src/sim/systems directly — so the sim
// stays swappable/testable independent of React.

export { createRegistry, ContentRegistry } from "./content/registry.js";
export { createInitialRunState, createInitialMetaState, RUN_STATE_VERSION, META_STATE_VERSION } from "./core/state.js";
export { tick } from "./core/tick.js";
export { runOfflineCatchUp } from "./core/offline.js";
export {
  TICKS_PER_DAY,
  TICKS_PER_HOUR,
  PROD_TICK_MS,
  DEV_TICK_MS,
  dayNumber,
  timeOfDayTicks,
  phaseForTick,
  sunArcProgress,
  moonArcProgress,
  ticksToHours,
  describeDayPhase,
  formatDuration,
} from "./core/time.js";
export { computeScore, resolveDeath } from "./core/score.js";
export { doomTier } from "./systems/doom.js";
export {
  exportRunState,
  importRunState,
  exportMetaState,
  importMetaState,
  saveRunToStorage,
  loadRunFromStorage,
  clearRunFromStorage,
  saveMetaToStorage,
  loadMetaFromStorage,
} from "./core/save.js";
export { startCraft } from "./systems/crafting.js";
export { startBuild } from "./systems/construction.js";
export { startMission } from "./systems/missions.js";
export { assignWorker, workersAvailable, roleIdleCount } from "./systems/workforce.js";
export { getActiveJobs } from "./core/jobs.js";
export { evaluateRequirement } from "./content/requirements.js";
