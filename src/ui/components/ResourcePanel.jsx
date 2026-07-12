function productionRate(state, registry, resourceId) {
  let rate = registry.getById("resource", resourceId).baseProduction ?? 0;
  for (const role of registry.allOfType("role")) {
    if (role.facilityId && !state.builtFacilities.includes(role.facilityId)) continue;
    const producing = (state.workers.assignments[role.id] ?? 0) - (
      state.activeMissions.filter((m) => m.roleId === role.id).reduce((sum, m) => sum + m.workerCount, 0)
    );
    if (producing <= 0) continue;
    for (const output of role.produces ?? []) {
      if (output.ref.id === resourceId) rate += producing * output.amountPerWorker;
    }
  }
  return rate;
}

export function ResourcePanel({ state, registry }) {
  return (
    <section>
      <h2>Resources</h2>
      <ul>
        {registry.allOfType("resource").map((resource) => {
          const rate = productionRate(state, registry, resource.id);
          return (
            <li key={resource.id}>
              {resource.name}: {Math.floor((state.resources[resource.id] ?? 0) * 100) / 100}
              {rate !== 0 && ` (${rate > 0 ? "+" : ""}${rate}/tick)`}
            </li>
          );
        })}
      </ul>

      <h2>Inventory</h2>
      <ul>
        {Object.entries(state.inventory).map(([itemId, count]) => (
          <li key={itemId}>
            {registry.getById("item", itemId).name}: {count}
          </li>
        ))}
        {Object.keys(state.inventory).length === 0 && <li>(empty)</li>}
      </ul>

      <h2>Town</h2>
      <ul>
        <li>Health: {state.town.health} / {state.town.maxHealth}</li>
        <li>Defense: {state.town.defense}</li>
        <li>Tick: {state.tick}</li>
        <li>Seed: {state.seed}</li>
      </ul>
    </section>
  );
}
