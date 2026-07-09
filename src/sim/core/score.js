// Scoring/meta-progression hook. Weights and narrative text are placeholders
// for now — the shape (reads the run log, returns a breakdown + summary) is
// what matters so death-summary UI and meta-progression can build on it.

/**
 * @param {object} runState
 * @param {import("./log.js").LogEntry[]} fullRunLog
 */
export function computeScore(runState, _fullRunLog) {
  return {
    score: 0,
    breakdown: {
      ticksSurvived: runState.tick,
      zonesDiscovered: runState.discoveredZones.length,
      questsCompleted: runState.completedQuests.length,
    },
    summary: "Placeholder death summary — scoring is not implemented yet.",
  };
}

/**
 * Called once when a run ends. Folds the run's outcome into meta state and
 * returns the score so the UI can render a death-summary screen.
 * @param {object} runState
 * @param {object} metaState
 * @param {import("./log.js").LogEntry[]} fullRunLog
 */
export function resolveDeath(runState, metaState, fullRunLog) {
  const result = computeScore(runState, fullRunLog);
  const nextMetaState = {
    ...metaState,
    runsCompleted: metaState.runsCompleted + 1,
    bestScore: Math.max(metaState.bestScore, result.score),
    lastDeathSummary: result,
  };
  return { result, metaState: nextMetaState };
}
