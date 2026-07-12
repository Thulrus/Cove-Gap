// Construction is player-intent driven, same shape as crafting: startBuild()
// validates requirements and cost and consumes cost up front, the tick-loop
// half just advances/completes whatever is already queued.

import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";

export function runConstructionSystem(state, registry) {
  const log = [];
  const stillBuilding = [];

  for (const job of state.constructionQueue) {
    job.remainingTicks -= 1;
    if (job.remainingTicks > 0) {
      stillBuilding.push(job);
      continue;
    }

    const facility = registry.getById("facility", job.facilityId);
    state.builtFacilities.push(facility.id);
    log.push(
      createLogEntry("construction", "facility_built", `Finished building ${facility.name}.`, {
        facilityId: facility.id,
      })
    );
  }

  state.constructionQueue = stillBuilding;
  return { log };
}

/**
 * Intent handler (not part of the tick loop): validates the facility's
 * requirements and cost, consumes cost immediately, and queues construction
 * to complete after `buildTicks` ticks.
 */
export function startBuild(state, registry, facilityId) {
  const facility = registry.getById("facility", facilityId);
  const ctx = { state, registry, system: "construction" };

  if (state.builtFacilities.includes(facility.id)) {
    return {
      success: false,
      log: [createLogEntry("construction", "build_blocked", `${facility.name} is already built.`, { facilityId })],
    };
  }
  if (state.constructionQueue.some((job) => job.facilityId === facility.id)) {
    return {
      success: false,
      log: [createLogEntry("construction", "build_blocked", `${facility.name} is already under construction.`, { facilityId })],
    };
  }
  if (!evaluateRequirement(facility.requirements, ctx)) {
    return {
      success: false,
      log: [createLogEntry("construction", "build_blocked", `Cannot build ${facility.name}: requirements not met.`, { facilityId })],
    };
  }

  const cost = facility.buildCost ?? [];
  for (const c of cost) {
    const have = state.resources[c.ref.id] ?? 0;
    if (have < c.amount) {
      const resource = registry.getById("resource", c.ref.id);
      return {
        success: false,
        log: [
          createLogEntry(
            "construction",
            "build_blocked",
            `Cannot build ${facility.name}: need ${c.amount} ${resource.name}.`,
            { facilityId }
          ),
        ],
      };
    }
  }

  const log = [];
  for (const c of cost) {
    state.resources[c.ref.id] -= c.amount;
  }

  state.constructionQueue.push({ facilityId: facility.id, remainingTicks: facility.buildTicks ?? 1 });
  log.push(createLogEntry("construction", "build_started", `Started building ${facility.name}.`, { facilityId }));
  return { success: true, log };
}
