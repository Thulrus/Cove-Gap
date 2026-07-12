// Normalizes each system's independent queue (crafting, construction,
// missions) into one shape for the UI's "jobs in progress" feed. Each system
// still owns and advances its own queue — this is a read-only view, not a
// merged queue, so systems stay decoupled.

export function getActiveJobs(state, registry) {
  const jobs = [];

  for (const job of state.craftingQueue) {
    const recipe = registry.getById("recipe", job.recipeId);
    jobs.push({ kind: "craft", id: `craft:${recipe.id}`, label: recipe.name, remainingTicks: job.remainingTicks });
  }

  for (const job of state.constructionQueue) {
    const facility = registry.getById("facility", job.facilityId);
    jobs.push({ kind: "build", id: `build:${facility.id}`, label: facility.name, remainingTicks: job.remainingTicks });
  }

  for (const job of state.activeMissions) {
    const mission = registry.getById("mission", job.missionId);
    jobs.push({
      kind: "mission",
      id: `mission:${job.id}`,
      label: `${mission.name} (${job.workerCount} worker(s))`,
      remainingTicks: job.remainingTicks,
    });
  }

  return jobs;
}
