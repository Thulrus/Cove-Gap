// Seeded, deterministic PRNG. Nothing in /src/sim may call Math.random() —
// every random draw must go through an RngState created here so runs stay
// reproducible and shareable by seed string.

function hashSeedToUint32(seedString) {
  // xmur3-style string hash, folded down to a single uint32.
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * @param {string} seed
 * @returns {{ seed: string, state: number }}
 */
export function createRng(seed) {
  return { seed, state: hashSeedToUint32(seed) };
}

/**
 * mulberry32 step. Mutates rngState.state in place and returns a float in [0, 1).
 */
export function nextFloat(rngState) {
  rngState.state = (rngState.state + 0x6d2b79f5) >>> 0;
  let t = rngState.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max], inclusive. */
export function nextInt(rngState, min, max) {
  return min + Math.floor(nextFloat(rngState) * (max - min + 1));
}

/** True with probability `chance` (0..1). */
export function chance(rngState, probability) {
  return nextFloat(rngState) < probability;
}

/** Uniform pick from a non-empty array. */
export function pick(rngState, array) {
  if (array.length === 0) {
    throw new Error("rng.pick: cannot pick from an empty array");
  }
  return array[nextInt(rngState, 0, array.length - 1)];
}

/** Fisher-Yates shuffle, returns a new array, does not mutate input. */
export function shuffle(rngState, array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = nextInt(rngState, 0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
