// A "monster instance" is a base monster entity plus an optional rolled
// modifier (see systems/events.js, which does the rolling). Composing the
// two here — instead of duplicating the logic in events.js and combat.js —
// means a raid's flavor text and its actual resolution always agree. See
// cove-gap-design-roadmap.md Phase 5.

export function describeMonsterInstance(monster, modifier) {
  return modifier ? `${modifier.name} ${monster.name}` : monster.name;
}

export function instanceAttack(monster, modifier) {
  return monster.combat.attack + (modifier?.attackMod ?? 0);
}

export function instanceWeaknesses(monster, modifier) {
  return [...(monster.weaknesses ?? []), ...(modifier?.weaknessAdd ?? [])];
}
