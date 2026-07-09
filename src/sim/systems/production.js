// Passive production: every resource with a baseProduction just accrues each
// tick. New resources are entirely data — no engine change needed to add one.

import { createLogEntry } from "../core/log.js";

export function runProductionSystem(state, registry) {
  const log = [];
  for (const resource of registry.allOfType("resource")) {
    const amount = resource.baseProduction ?? 0;
    if (amount === 0) continue;
    const total = (state.resources[resource.id] ?? 0) + amount;
    state.resources[resource.id] = total;
    log.push(
      createLogEntry("production", "resource_produced", `Produced ${amount} ${resource.name}.`, {
        resourceId: resource.id,
        amount,
        total,
      })
    );
  }
  return { log };
}
