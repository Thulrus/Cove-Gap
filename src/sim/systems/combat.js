// Resolves whatever raid the events system triggered: monster attack vs.
// town defense, with a little rng variance. Town falling flips state.alive,
// which the tick loop checks to stop running further systems/ticks.

import { nextInt } from "../core/rng.js";
import { createLogEntry } from "../core/log.js";

export function runCombatSystem(state, registry) {
  const log = [];
  if (!state.pendingCombat) return { log };

  const monster = registry.getById("monster", state.pendingCombat.monsterId);
  const variance = nextInt(state.rng, -2, 2);
  const damage = Math.max(0, monster.combat.attack - state.town.defense + variance);

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
