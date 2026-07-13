// Derives the in-fiction day/night cycle from the single `state.tick`
// counter. Nothing here is stored on state — day number, time-of-day, and
// phase are all recomputed on read so they can never drift out of sync with
// the tick count that everything else (jobs, production) already uses.

export const TICKS_PER_DAY = 240;
export const TICKS_PER_HOUR = TICKS_PER_DAY / 24;

// Real-world milliseconds per tick. Prod is slow enough that a player can
// read what changed each tick; dev is fast so a full day cycles in seconds
// during manual testing. `useSimRun` picks between these via `import.meta.env.DEV`.
export const PROD_TICK_MS = 1000;
export const DEV_TICK_MS = 100;

// Phase bands as fractions of a day. Dawn/dusk are short transitions; day
// and night make up the bulk of the cycle.
const PHASE_BANDS = [
  { phase: "dawn", end: 0.1 },
  { phase: "day", end: 0.55 },
  { phase: "dusk", end: 0.65 },
  { phase: "night", end: 1 },
];

export function timeOfDayTicks(tick, ticksPerDay = TICKS_PER_DAY) {
  return ((tick % ticksPerDay) + ticksPerDay) % ticksPerDay;
}

export function dayNumber(tick, ticksPerDay = TICKS_PER_DAY) {
  return Math.floor(tick / ticksPerDay) + 1;
}

export function phaseForTick(tick, ticksPerDay = TICKS_PER_DAY) {
  const frac = timeOfDayTicks(tick, ticksPerDay) / ticksPerDay;
  return PHASE_BANDS.find((band) => frac < band.end).phase;
}

// 0 (dawn horizon) to 1 (dusk horizon) while the sun is up, otherwise null.
export function sunArcProgress(tick, ticksPerDay = TICKS_PER_DAY) {
  const frac = timeOfDayTicks(tick, ticksPerDay) / ticksPerDay;
  const duskEnd = PHASE_BANDS[2].end;
  return frac < duskEnd ? frac / duskEnd : null;
}

// 0 (dusk horizon) to 1 (dawn horizon) while the moon is up, otherwise null.
export function moonArcProgress(tick, ticksPerDay = TICKS_PER_DAY) {
  const frac = timeOfDayTicks(tick, ticksPerDay) / ticksPerDay;
  const duskEnd = PHASE_BANDS[2].end;
  return frac >= duskEnd ? (frac - duskEnd) / (1 - duskEnd) : null;
}

export function ticksToHours(ticks, ticksPerDay = TICKS_PER_DAY) {
  const ticksPerHour = ticksPerDay / 24;
  return Math.max(1, Math.ceil(ticks / ticksPerHour));
}

// For spans of elapsed time (offline catch-up, survival duration) rather
// than a point on the clock — "2 days, 3 hours", not a phase name.
export function formatDuration(ticks, ticksPerDay = TICKS_PER_DAY) {
  const totalHours = Math.floor(ticks / (ticksPerDay / 24));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export function describeDayPhase(tick, ticksPerDay = TICKS_PER_DAY) {
  const day = dayNumber(tick, ticksPerDay);
  const phase = phaseForTick(tick, ticksPerDay);
  const label = phase.charAt(0).toUpperCase() + phase.slice(1);
  return { day, phase, label: `Day ${day} — ${label}` };
}
