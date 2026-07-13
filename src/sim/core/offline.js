// Headless offline-progress catch-up: replays however many ticks elapsed
// wall-clock time implies, using the exact same tick() as the live loop, so
// there's only one code path to keep deterministic.

import { tick } from "./tick.js";
import { PROD_TICK_MS } from "./time.js";

const MAX_OFFLINE_TICKS = 60 * 60 * 24; // cap catch-up to a day's worth of ticks

export function runOfflineCatchUp(state, registry, { tickMs = PROD_TICK_MS, now = Date.now() } = {}) {
  const elapsedMs = Math.max(0, now - state.lastTickAt);
  const ticksToRun = Math.min(Math.floor(elapsedMs / tickMs), MAX_OFFLINE_TICKS);

  const combinedLog = [];
  let ticksRun = 0;
  for (; ticksRun < ticksToRun && state.alive; ticksRun++) {
    const { log } = tick(state, registry);
    combinedLog.push(...log);
  }
  return { log: combinedLog, ticksRun };
}
