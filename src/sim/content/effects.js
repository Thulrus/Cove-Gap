// Effects are the declarative, reusable vocabulary of triggered actions
// (on quest-stage complete, on recipe craft, on event resolution, ...).
// Adding a new effect type is one handler here, usable by any content type
// that lists it — engine code stays generic, behavior stays in data.

import { assert, assertPositiveNumber } from "./validationUtils.js";
import { validateEntityRef, resolveRefEntities, describeRef } from "./refs.js";
import { createLogEntry } from "../core/log.js";

const EFFECT_HANDLERS = {
  grantItem: {
    validate(node, path) {
      validateEntityRef(node.ref, `${path}.ref`);
      assert(node.ref.id !== undefined, `${path}.ref must reference a specific item id, not a tag`);
      if (node.count !== undefined) assertPositiveNumber(node.count, `${path}.count`);
    },
    apply(node, ctx) {
      const count = node.count ?? 1;
      const item = ctx.registry.getById("item", node.ref.id);
      ctx.state.inventory[item.id] = (ctx.state.inventory[item.id] ?? 0) + count;
      return [
        createLogEntry(ctx.system, "item_granted", `Received ${count}x ${item.name}.`, {
          itemId: item.id,
          count,
        }),
      ];
    },
  },

  consumeItem: {
    validate(node, path) {
      validateEntityRef(node.ref, `${path}.ref`);
      if (node.count !== undefined) assertPositiveNumber(node.count, `${path}.count`);
    },
    apply(node, ctx) {
      const count = node.count ?? 1;
      let remaining = count;
      const candidateIds = new Set(resolveRefEntities(ctx.registry, "item", node.ref).map((item) => item.id));
      for (const itemId of Object.keys(ctx.state.inventory)) {
        if (remaining <= 0) break;
        if (!candidateIds.has(itemId)) continue;
        const take = Math.min(ctx.state.inventory[itemId], remaining);
        ctx.state.inventory[itemId] -= take;
        if (ctx.state.inventory[itemId] <= 0) delete ctx.state.inventory[itemId];
        remaining -= take;
      }
      if (remaining > 0) {
        throw new Error(`consumeItem effect: not enough items matching ${describeRef(node.ref)} to consume ${count}`);
      }
      return [
        createLogEntry(ctx.system, "item_consumed", `Used ${count}x ${describeRef(node.ref)}.`, {
          ref: node.ref,
          count,
        }),
      ];
    },
  },

  modifyResource: {
    validate(node, path) {
      assert(node.ref && typeof node.ref.id === "string", `${path}.ref.id is required`);
      assert(typeof node.amount === "number", `${path}.amount must be a number`);
    },
    apply(node, ctx) {
      const resource = ctx.registry.getById("resource", node.ref.id);
      const next = (ctx.state.resources[resource.id] ?? 0) + node.amount;
      ctx.state.resources[resource.id] = next;
      const verb = node.amount >= 0 ? "Gained" : "Lost";
      return [
        createLogEntry(ctx.system, "resource_changed", `${verb} ${Math.abs(node.amount)} ${resource.name}.`, {
          resourceId: resource.id,
          amount: node.amount,
          total: next,
        }),
      ];
    },
  },

  setFlag: {
    validate(node, path) {
      assert(typeof node.id === "string", `${path}.id is required`);
    },
    apply(node, ctx) {
      const value = node.value ?? true;
      ctx.state.flags[node.id] = value;
      return [createLogEntry(ctx.system, "flag_set", `Flag "${node.id}" set to ${value}.`, { id: node.id, value })];
    },
  },

  modifyWorkers: {
    validate(node, path) {
      assert(typeof node.amount === "number", `${path}.amount must be a number`);
    },
    apply(node, ctx) {
      ctx.state.workers.total = Math.max(0, ctx.state.workers.total + node.amount);
      const verb = node.amount >= 0 ? "joins" : "leaves";
      const count = Math.abs(node.amount);
      return [
        createLogEntry(ctx.system, "workers_changed", `${count} worker(s) ${verb} the town.`, {
          amount: node.amount,
          total: ctx.state.workers.total,
        }),
      ];
    },
  },

  discoverZone: {
    validate(node, path) {
      assert(node.ref && typeof node.ref.id === "string", `${path}.ref.id is required`);
    },
    apply(node, ctx) {
      const zone = ctx.registry.getById("zone", node.ref.id);
      if (ctx.state.discoveredZones.includes(zone.id)) return [];
      ctx.state.discoveredZones.push(zone.id);
      return [createLogEntry(ctx.system, "zone_discovered", `Discovered ${zone.name}.`, { zoneId: zone.id })];
    },
  },
};

export function validateEffectNode(node, path) {
  assert(node && typeof node === "object", `${path} must be an object`);
  assert(typeof node.type === "string", `${path}.type is required`);
  const handler = EFFECT_HANDLERS[node.type];
  assert(handler, `${path}: unknown effect type "${node.type}"`);
  handler.validate(node, path);
}

/** ctx: { state, registry, system } */
export function applyEffects(effects, ctx) {
  const log = [];
  for (const effect of effects) {
    const handler = EFFECT_HANDLERS[effect.type];
    if (!handler) throw new Error(`Unknown effect type "${effect.type}" encountered at runtime`);
    log.push(...handler.apply(effect, ctx));
  }
  return log;
}
