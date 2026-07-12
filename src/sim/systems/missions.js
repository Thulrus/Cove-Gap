// Missions are time-boxed jobs crewed by workers already assigned to a role
// (e.g. explorer duty). Starting one doesn't change `assignments` — it just
// marks that many of the role's workers as "out" for the duration (see
// workforce.roleIdleCount), so they stop producing and can't crew a second
// mission until this one returns.

import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";
import { applyEffects } from "../content/effects.js";
import { roleIdleCount } from "./workforce.js";

export function runMissionSystem(state, registry) {
  const log = [];
  const stillOut = [];

  for (const job of state.activeMissions) {
    job.remainingTicks -= 1;
    if (job.remainingTicks > 0) {
      stillOut.push(job);
      continue;
    }

    const mission = registry.getById("mission", job.missionId);
    log.push(
      createLogEntry("missions", "mission_completed", `${mission.name} returns.`, {
        missionId: mission.id,
        workerCount: job.workerCount,
      })
    );
    if (mission.effects?.length) {
      log.push(...applyEffects(mission.effects, { state, registry, system: "missions" }));
    }
  }

  state.activeMissions = stillOut;
  return { log };
}

/**
 * Intent handler: validates the role has enough idle (assigned, not already
 * out) workers plus the mission's own requirements, then sends `workerCount`
 * of them out for `durationTicks`.
 */
export function startMission(state, registry, missionId, workerCount) {
  const mission = registry.getById("mission", missionId);
  const ctx = { state, registry, system: "missions" };

  if (workerCount < mission.workerCost.min || workerCount > mission.workerCost.max) {
    return {
      success: false,
      log: [
        createLogEntry(
          "missions",
          "mission_blocked",
          `${mission.name} needs between ${mission.workerCost.min} and ${mission.workerCost.max} workers.`,
          { missionId }
        ),
      ],
    };
  }
  if (roleIdleCount(state, mission.roleId) < workerCount) {
    const role = registry.getById("role", mission.roleId);
    return {
      success: false,
      log: [
        createLogEntry(
          "missions",
          "mission_blocked",
          `Not enough idle workers assigned to ${role.name} to start ${mission.name}.`,
          { missionId }
        ),
      ],
    };
  }
  if (!evaluateRequirement(mission.requirements, ctx)) {
    return {
      success: false,
      log: [createLogEntry("missions", "mission_blocked", `Cannot start ${mission.name}: requirements not met.`, { missionId })],
    };
  }

  const id = state.nextMissionInstanceId++;
  state.activeMissions.push({
    id,
    missionId: mission.id,
    roleId: mission.roleId,
    workerCount,
    remainingTicks: mission.durationTicks,
  });

  return {
    success: true,
    log: [createLogEntry("missions", "mission_started", `${workerCount} worker(s) set out on ${mission.name}.`, { missionId })],
  };
}
