import { evaluateRequirement, roleIdleCount, ticksToHours } from "../../sim/index.js";
import { ProgressBar } from "./ProgressBar.jsx";

function canAffordFacility(state, registry, facility) {
  return (facility.buildCost ?? []).every((c) => (state.resources[c.ref.id] ?? 0) >= c.amount);
}

export function JobsInProgress({ activeJobs }) {
  return (
    <section className="panel">
      <h2>Jobs In Progress</h2>
      {activeJobs.map((job) => (
        <div key={job.id} className="job-row">
          <div className="job-row-label">
            <span>
              <span className="job-row-tag">[{job.kind}]</span>
              {job.label}
            </span>
            <span>
              {ticksToHours(job.remainingTicks)} hour{ticksToHours(job.remainingTicks) === 1 ? "" : "s"} left
            </span>
          </div>
          <ProgressBar
            value={(job.totalTicks ?? job.remainingTicks) - job.remainingTicks}
            max={job.totalTicks ?? job.remainingTicks}
          />
        </div>
      ))}
      {activeJobs.length === 0 && <p>(nothing in progress)</p>}
    </section>
  );
}

export function AvailableJobs({ state, registry, onBuild, onSendOnMission }) {
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
    <section className="panel">
      <h2>Available to Build</h2>
      {buildableFacilities.map((facility) => (
        <div key={facility.id} className="recipe-row">
          <span>
            <strong>{facility.name}</strong> — {facility.description}
          </span>
          <button type="button" className="primary" onClick={() => onBuild(facility.id)}>
            Build
          </button>
        </div>
      ))}
      {buildableFacilities.length === 0 && <p>(none available)</p>}

      <h2>Available Missions</h2>
      {startableMissions.map((mission) => {
        const idle = roleIdleCount(state, mission.roleId);
        const workerCount = Math.min(idle, mission.workerCost.max);
        return (
          <div key={mission.id} className="recipe-row">
            <span>
              <strong>{mission.name}</strong> — {mission.description} ({mission.workerCost.min}-{mission.workerCost.max}{" "}
              workers, {ticksToHours(mission.durationTicks)} hour{ticksToHours(mission.durationTicks) === 1 ? "" : "s"})
            </span>
            <button type="button" className="primary" onClick={() => onSendOnMission(mission.id, workerCount)}>
              Send {workerCount}
            </button>
          </div>
        );
      })}
      {startableMissions.length === 0 && <p>(none available)</p>}
    </section>
  );
}
