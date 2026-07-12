import { evaluateRequirement, roleIdleCount } from "../../sim/index.js";

function canAffordFacility(state, registry, facility) {
  return (facility.buildCost ?? []).every((c) => (state.resources[c.ref.id] ?? 0) >= c.amount);
}

export function JobsPanel({ state, registry, activeJobs, onBuild, onSendOnMission }) {
  const ctx = { state, registry };

  const buildableFacilities = registry.allOfType("facility").filter(
    (facility) =>
      !state.builtFacilities.includes(facility.id) &&
      !state.constructionQueue.some((job) => job.facilityId === facility.id) &&
      evaluateRequirement(facility.requirements, ctx) &&
      canAffordFacility(state, registry, facility)
  );

  const startableMissions = registry
    .allOfType("mission")
    .filter((mission) => roleIdleCount(state, mission.roleId) >= mission.workerCost.min && evaluateRequirement(mission.requirements, ctx));

  return (
    <section>
      <h2>Jobs</h2>

      <h3>In Progress</h3>
      <ul>
        {activeJobs.map((job) => (
          <li key={job.id}>
            [{job.kind}] {job.label} — {job.remainingTicks} tick(s) left
          </li>
        ))}
        {activeJobs.length === 0 && <li>(nothing in progress)</li>}
      </ul>

      <h3>Available to Build</h3>
      <ul>
        {buildableFacilities.map((facility) => (
          <li key={facility.id} className="recipe-row">
            <span>
              <strong>{facility.name}</strong> — {facility.description}
            </span>
            <button type="button" onClick={() => onBuild(facility.id)}>
              Build
            </button>
          </li>
        ))}
        {buildableFacilities.length === 0 && <li>(none available)</li>}
      </ul>

      <h3>Available Missions</h3>
      <ul>
        {startableMissions.map((mission) => {
          const idle = roleIdleCount(state, mission.roleId);
          const workerCount = Math.min(idle, mission.workerCost.max);
          return (
            <li key={mission.id} className="recipe-row">
              <span>
                <strong>{mission.name}</strong> — {mission.description} ({mission.workerCost.min}-{mission.workerCost.max}{" "}
                workers, {mission.durationTicks} ticks)
              </span>
              <button type="button" onClick={() => onSendOnMission(mission.id, workerCount)}>
                Send {workerCount}
              </button>
            </li>
          );
        })}
        {startableMissions.length === 0 && <li>(none available)</li>}
      </ul>
    </section>
  );
}
