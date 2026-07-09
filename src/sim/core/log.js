// Logging convention shared by every system. Systems never mutate state
// silently — they report what happened as a list of LogEntry objects, which
// powers the live activity feed, the offline "while you were away" summary,
// and eventually death-summary scoring.

/**
 * @param {string} system   which system emitted this (e.g. "combat")
 * @param {string} type     specific event key (e.g. "monster_defeated")
 * @param {string} message  human-readable line for the activity feed
 * @param {object} [data]   structured payload for scoring/summary generation
 */
export function createLogEntry(system, type, message, data = {}) {
  return { system, type, message, data };
}

export const ACTIVITY_LOG_LIMIT = 200;

/** Appends new entries to state's bounded activity feed, dropping the oldest. */
export function appendActivityLog(state, entries) {
  if (entries.length === 0) return;
  state.activityLog.push(...entries);
  const overflow = state.activityLog.length - ACTIVITY_LOG_LIMIT;
  if (overflow > 0) {
    state.activityLog.splice(0, overflow);
  }
}
