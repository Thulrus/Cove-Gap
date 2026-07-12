// Worker bookkeeping shared by production, construction, and missions.
// Assignment is a player intent (like startCraft), not a tick-loop system —
// it just moves workers between "available" and a role, instantly.

import { createLogEntry } from "../core/log.js";

/** Workers not currently assigned to any role. */
export function workersAvailable(state) {
  const assigned = Object.values(state.workers.assignments).reduce((sum, n) => sum + n, 0);
  return state.workers.total - assigned;
}

/** Of the workers assigned to a role, how many aren't currently out on a mission. */
export function roleIdleCount(state, roleId) {
  const assigned = state.workers.assignments[roleId] ?? 0;
  const onMission = state.activeMissions
    .filter((m) => m.roleId === roleId)
    .reduce((sum, m) => sum + m.workerCount, 0);
  return assigned - onMission;
}

/**
 * Moves `delta` workers into (positive) or out of (negative) a role.
 * Validates against total availability, role capacity, and — when removing —
 * against workers currently out on a mission (those can't be unassigned).
 */
export function assignWorker(state, registry, roleId, delta) {
  const role = registry.getById("role", roleId);

  if (delta > 0) {
    if (workersAvailable(state) < delta) {
      return {
        success: false,
        log: [createLogEntry("workforce", "assign_blocked", `Not enough available workers to assign to ${role.name}.`, { roleId })],
      };
    }
    const nextAssigned = (state.workers.assignments[roleId] ?? 0) + delta;
    if (role.capacity !== undefined && nextAssigned > role.capacity) {
      return {
        success: false,
        log: [createLogEntry("workforce", "assign_blocked", `${role.name} is at capacity.`, { roleId })],
      };
    }
    state.workers.assignments[roleId] = nextAssigned;
  } else {
    const remove = -delta;
    if (roleIdleCount(state, roleId) < remove) {
      return {
        success: false,
        log: [
          createLogEntry(
            "workforce",
            "assign_blocked",
            `Can't unassign from ${role.name}: workers are out on a mission.`,
            { roleId }
          ),
        ],
      };
    }
    state.workers.assignments[roleId] -= remove;
    if (state.workers.assignments[roleId] <= 0) delete state.workers.assignments[roleId];
  }

  return {
    success: true,
    log: [createLogEntry("workforce", "worker_assigned", `${role.name}: ${delta > 0 ? "+" : ""}${delta} worker(s).`, { roleId, delta })],
  };
}
