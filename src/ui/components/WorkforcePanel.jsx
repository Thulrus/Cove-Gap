import { workersAvailable, roleIdleCount } from "../../sim/index.js";
import { ProgressBar } from "./ProgressBar.jsx";

export function WorkforcePanel({ state, registry, onAssign }) {
  const available = workersAvailable(state);
  const visibleRoles = registry
    .allOfType("role")
    .filter((role) => !role.facilityId || state.builtFacilities.includes(role.facilityId));

  return (
    <section className="panel">
      <h2>Workforce</h2>
      <p className="dashboard-stat-label">
        {available} available / {state.workers.total} total
      </p>
      {visibleRoles.map((role) => {
        const assigned = state.workers.assignments[role.id] ?? 0;
        const idle = roleIdleCount(state, role.id);
        const onMission = assigned - idle;
        return (
          <div key={role.id} className="recipe-row">
            <span>
              <strong>{role.name}</strong>: {assigned} assigned
              {onMission > 0 && ` (${onMission} out)`}
              {role.capacity !== undefined && ` / ${role.capacity} max`}
              {role.capacity !== undefined && (
                <ProgressBar value={assigned} max={role.capacity} />
              )}
            </span>
            <span>
              <button type="button" onClick={() => onAssign(role.id, -1)} disabled={idle <= 0}>
                -
              </button>
              <button
                type="button"
                onClick={() => onAssign(role.id, 1)}
                disabled={available <= 0 || (role.capacity !== undefined && assigned >= role.capacity)}
              >
                +
              </button>
            </span>
          </div>
        );
      })}
    </section>
  );
}
