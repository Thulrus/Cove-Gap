// Resolves whatever raid the events system triggered: monster attack vs.
// town defense, with a little rng variance. Town falling flips state.alive,
// which the tick loop checks to stop running further systems/ticks.
//
// If the town holds an item matching one of the monster's weaknesses (by id
// or tag), the raid's attack is blunted. This is generic over any monster's
// weaknesses and any item's tags — no monster- or item-specific code here.

import { nextInt } from "../core/rng.js";
import { createLogEntry } from "../core/log.js";
import { resolveRefEntities, describeRef } from "../content/refs.js";

function findExploitedWeakness(state, registry, monster) {
  for (const weaknessRef of monster.weaknesses ?? []) {
    const matchingIds = new Set(resolveRefEntities(registry, "item", weaknessRef).map((item) => item.id));
    const held = Object.keys(state.inventory).some((itemId) => matchingIds.has(itemId) && state.inventory[itemId] > 0);
    if (held) return weaknessRef;
  }
  return null;
}

export function runCombatSystem(state, registry) {
  const log = [];
  if (!state.pendingCombat) return { log };

  const monster = registry.getById("monster", state.pendingCombat.monsterId);
  const exploitedWeakness = findExploitedWeakness(state, registry, monster);
  const baseAttack = exploitedWeakness ? Math.round(monster.combat.attack / 2) : monster.combat.attack;

  if (exploitedWeakness) {
    log.push(
      createLogEntry(
        "combat",
        "weakness_exploited",
        `The town holds ${describeRef(exploitedWeakness)} — ${monster.name}'s attack falters.`,
        { monsterId: monster.id, weakness: exploitedWeakness }
      )
    );
  }

  const variance = nextInt(state.rng, -2, 2);
  const damage = Math.max(0, baseAttack - state.town.defense + variance);

  if (damage > 0) {
    state.town.health = Math.max(0, state.town.health - damage);
    log.push(
      createLogEntry("combat", "town_damaged", `${monster.name} deals ${damage} damage to the town.`, {
        monsterId: monster.id,
        damage,
      })
    );
  } else {
    log.push(
      createLogEntry("combat", "raid_repelled", `The town's defenses repel ${monster.name} without harm.`, {
        monsterId: monster.id,
      })
    );
  }

  state.pendingCombat = null;

  if (state.town.health <= 0) {
    state.alive = false;
    log.push(createLogEntry("combat", "town_fallen", "The town has fallen.", {}));
  }

  return { log };
}
