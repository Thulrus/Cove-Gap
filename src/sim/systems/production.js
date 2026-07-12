// Passive production: each role with `produces` adds amountPerWorker times
// its currently-assigned worker count to the named resource(s), every tick.
// Roles gated behind a facility only produce once that facility is built.
// Workers out on a mission still count as "assigned" but don't produce (see
// workforce.roleIdleCount) — the mission itself is what they're doing instead.
// New resources/roles are entirely data — no engine change needed to add one.

import { createLogEntry } from "../core/log.js";

export function runProductionSystem(state, registry) {
  const log = [];

  for (const role of registry.allOfType("role")) {
    const assigned = state.workers.assignments[role.id] ?? 0;
    if (assigned === 0 || !role.produces?.length) continue;
    if (role.facilityId && !state.builtFacilities.includes(role.facilityId)) continue;

    const onMission = state.activeMissions
      .filter((m) => m.roleId === role.id)
      .reduce((sum, m) => sum + m.workerCount, 0);
    const producing = assigned - onMission;
    if (producing <= 0) continue;

    for (const output of role.produces) {
      const amount = producing * output.amountPerWorker;
      if (amount === 0) continue;
      const resource = registry.getById("resource", output.ref.id);
      const total = (state.resources[resource.id] ?? 0) + amount;
      state.resources[resource.id] = total;
      log.push(
        createLogEntry("production", "resource_produced", `${role.name} produced ${amount} ${resource.name}.`, {
          resourceId: resource.id,
          roleId: role.id,
          amount,
          total,
        })
      );
    }
  }

  // Resources may still declare a flat baseProduction for genuinely passive
  // accrual that doesn't need a worker (e.g. ambient regen).
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
