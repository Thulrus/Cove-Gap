// Rites are player-intent driven, same shape as crafting/construction:
// performRite() validates cost and consumes it immediately, then resolves
// on the spot — there's no queue, a rite is a single act.
//
// The Brotherhood's faith is a real but Aspect-specific tool: a rite only
// lowers doom if the Aspect it *actually* wards against (not the Aspect the
// Brotherhood believes it wards against — see each rite's `misunderstanding`
// text) currently has a presence in a discovered zone. Performed with
// nothing of that Aspect nearby, it's wasted motion that disturbs something
// instead of soothing it. See cove-gap-design-roadmap.md Phase 4.

import { createLogEntry } from "../core/log.js";
import { addDoom } from "./doom.js";

const RITE_MISFIRE_DOOM = 4;

function aspectIsPresent(state, registry, aspectId) {
  return registry
    .allOfType("zone")
    .some((zone) => state.discoveredZones.includes(zone.id) && zone.aspectRef?.id === aspectId);
}

/**
 * Intent handler (not part of the tick loop): validates the rite's cost,
 * consumes it immediately, and resolves the rite's effect right away.
 */
export function performRite(state, registry, riteId) {
  const rite = registry.getById("rite", riteId);
  const cost = rite.cost ?? [];

  for (const c of cost) {
    const have = state.resources[c.ref.id] ?? 0;
    if (have < c.amount) {
      const resource = registry.getById("resource", c.ref.id);
      return {
        success: false,
        log: [
          createLogEntry("rites", "rite_blocked", `Cannot perform ${rite.name}: need ${c.amount} ${resource.name}.`, {
            riteId,
          }),
        ],
      };
    }
  }

  for (const c of cost) {
    state.resources[c.ref.id] -= c.amount;
  }

  const log = [];
  const targeted = aspectIsPresent(state, registry, rite.effect.aspectRef.id);

  if (targeted) {
    addDoom(state, -rite.effect.doomDelta);
    log.push(
      createLogEntry("rites", "rite_performed", `${rite.name} is performed. The rite holds.`, {
        riteId,
        aspectId: rite.effect.aspectRef.id,
        doomDelta: -rite.effect.doomDelta,
      })
    );
  } else {
    addDoom(state, RITE_MISFIRE_DOOM);
    log.push(
      createLogEntry(
        "rites",
        "rite_misfired",
        `${rite.name} is performed, but there is nothing here for it to ward against. Something else takes notice instead.`,
        { riteId, doomDelta: RITE_MISFIRE_DOOM }
      )
    );
  }

  return { success: true, log };
}
