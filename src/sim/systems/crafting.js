// Crafting is player-intent driven: startCraft() is called by the UI (or any
// sim caller) to queue a recipe, validating requirements and consuming
// inputs up front. The tick-loop half of this system just advances/completes
// whatever is already queued, so it fits the fixed per-tick system order.

import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";
import { applyEffects } from "../content/effects.js";
import { countInventoryMatching, describeRef } from "../content/refs.js";

export function runCraftingSystem(state, registry) {
  const log = [];
  const stillCrafting = [];

  for (const job of state.craftingQueue) {
    job.remainingTicks -= 1;
    if (job.remainingTicks > 0) {
      stillCrafting.push(job);
      continue;
    }

    const recipe = registry.getById("recipe", job.recipeId);
    for (const outputRef of recipe.outputs) {
      const item = registry.getById("item", outputRef.id);
      const count = outputRef.count ?? 1;
      state.inventory[item.id] = (state.inventory[item.id] ?? 0) + count;
      log.push(
        createLogEntry("crafting", "recipe_completed", `Finished crafting ${count}x ${item.name}.`, {
          recipeId: recipe.id,
          itemId: item.id,
          count,
        })
      );
    }
    if (recipe.effects?.length) {
      log.push(...applyEffects(recipe.effects, { state, registry, system: "crafting" }));
    }
  }

  state.craftingQueue = stillCrafting;
  return { log };
}

/**
 * Intent handler (not part of the tick loop): validates the recipe's
 * requirements and input availability, consumes inputs immediately, and
 * queues the craft to complete after `craftTicks` ticks.
 */
export function startCraft(state, registry, recipeId) {
  const recipe = registry.getById("recipe", recipeId);
  const ctx = { state, registry, system: "crafting" };

  if (!evaluateRequirement(recipe.requirements, ctx)) {
    return {
      success: false,
      log: [createLogEntry("crafting", "craft_blocked", `Cannot craft ${recipe.name}: requirements not met.`, { recipeId })],
    };
  }

  for (const input of recipe.inputs) {
    const needed = input.count ?? 1;
    if (countInventoryMatching(state, registry, input) < needed) {
      return {
        success: false,
        log: [
          createLogEntry(
            "crafting",
            "craft_blocked",
            `Cannot craft ${recipe.name}: need ${needed}x ${describeRef(input)}.`,
            { recipeId }
          ),
        ],
      };
    }
  }

  const log = [];
  for (const input of recipe.inputs) {
    log.push(...applyEffects([{ type: "consumeItem", ref: input, count: input.count ?? 1 }], ctx));
  }

  state.craftingQueue.push({ recipeId: recipe.id, remainingTicks: recipe.craftTicks ?? 1 });
  log.push(createLogEntry("crafting", "craft_started", `Started crafting ${recipe.name}.`, { recipeId }));
  return { success: true, log };
}
