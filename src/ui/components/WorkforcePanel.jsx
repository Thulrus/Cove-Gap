import { workersAvailable, roleIdleCount } from "../../sim/index.js";

export function WorkforcePanel({ state, registry, onAssign }) {
  const available = workersAvailable(state);
  const visibleRoles = registry
    .allOfType("role")
    .filter((role) => !role.facilityId || state.builtFacilities.includes(role.facilityId));

  return (
    <section>
      <h2>Workforce</h2>
      <p>
        {available} available / {state.workers.total} total
      </p>
      <ul>
        {visibleRoles.map((role) => {
          const assigned = state.workers.assignments[role.id] ?? 0;
          const idle = roleIdleCount(state, role.id);
          const onMission = assigned - idle;
          return (
            <li key={role.id} className="recipe-row">
              <span>
                <strong>{role.name}</strong>: {assigned} assigned
                {onMission > 0 && ` (${onMission} out)`}
                {role.capacity !== undefined && ` / ${role.capacity} max`}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
