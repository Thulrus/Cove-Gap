export function productionRate(state, registry, resourceId) {
  let rate = registry.getById("resource", resourceId).baseProduction ?? 0;
  for (const role of registry.allOfType("role")) {
    if (role.facilityId && !state.builtFacilities.includes(role.facilityId)) continue;
    const producing =
      (state.workers.assignments[role.id] ?? 0) -
      state.activeMissions.filter((m) => m.roleId === role.id).reduce((sum, m) => sum + m.workerCount, 0);
    if (producing <= 0) continue;
    for (const output of role.produces ?? []) {
      if (output.ref.id === resourceId) rate += producing * output.amountPerWorker;
    }
  }
  return rate;
}
