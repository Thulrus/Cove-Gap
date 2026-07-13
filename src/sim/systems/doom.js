// Tracks how much the Dark Green has "noticed" the town. Doom rises from a
// slow baseline drift (the world doesn't need a reason) plus disturbance
// bumps from specific player actions (zone discovery for now; missions and
// rites can add more later). It scales the raid chance, and later phases
// will use it to gate which entities can appear in a raid — see
// cove-gap-design-roadmap.md Phase 1/3.
//
// Doom is deliberately never surfaced to the player as a raw number — see
// doomTier() below, which is the only sanctioned way to talk about it in UI.

const MAX_DOOM = 100;
const DOOM_DRIFT_PER_TICK = 0.015;

export const ZONE_DISCOVERY_DOOM_PER_DANGER = 3;

const BASE_RAID_CHANCE = 0.05;
const DOOM_RAID_SCALING = 0.003; // +0.3% raid chance per point of doom
const MAX_RAID_CHANCE = 0.4;

/** Raises (or lowers) doom by `amount`, clamped to [0, MAX_DOOM], and tracks the run's peak. */
export function addDoom(state, amount) {
  state.doom = Math.max(0, Math.min(MAX_DOOM, state.doom + amount));
  state.peakDoom = Math.max(state.peakDoom, state.doom);
}

export function runDoomSystem(state, _registry) {
  addDoom(state, DOOM_DRIFT_PER_TICK);
  return { log: [] };
}

/** How likely a raid is to trigger this tick, given the current doom level. */
export function raidChanceForDoom(doom) {
  return Math.min(MAX_RAID_CHANCE, BASE_RAID_CHANCE + doom * DOOM_RAID_SCALING);
}

// Ambient-text tiers, not a number — the lore's "evidence before encounter"
// principle argues against ever showing the player a raw doom meter.
const DOOM_TIERS = [
  { max: 15, label: "calm", text: "The woods are quiet." },
  { max: 35, label: "uneasy", text: "Something out there has started paying attention." },
  { max: 60, label: "dread", text: "The dark feels closer than it did." },
  { max: 85, label: "close", text: "It knows you're here now." },
  { max: Infinity, label: "consumed", text: "It is almost done noticing you." },
];

export function doomTier(doom) {
  return DOOM_TIERS.find((tier) => doom <= tier.max);
}
