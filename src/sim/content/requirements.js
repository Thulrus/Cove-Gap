// Requirement nodes gate whether something can happen (start a quest stage,
// craft a recipe, discover a zone). They're a small recursive condition tree;
// unknown node types fail loud at content-load time, not silently at eval time.

import { assert, assertArray } from "./validationUtils.js";
import { validateEntityRef, countInventoryMatching } from "./refs.js";

const REQUIREMENT_HANDLERS = {
  all: {
    validate(node, path) {
      assertArray(node.of, `${path}.of`);
      node.of.forEach((child, i) => validateRequirementNode(child, `${path}.of[${i}]`));
    },
    evaluate(node, ctx) {
      return node.of.every((child) => evaluateRequirement(child, ctx));
    },
  },
  any: {
    validate(node, path) {
      assertArray(node.of, `${path}.of`);
      node.of.forEach((child, i) => validateRequirementNode(child, `${path}.of[${i}]`));
    },
    evaluate(node, ctx) {
      return node.of.some((child) => evaluateRequirement(child, ctx));
    },
  },
  not: {
    validate(node, path) {
      validateRequirementNode(node.of, `${path}.of`);
    },
    evaluate(node, ctx) {
      return !evaluateRequirement(node.of, ctx);
    },
  },
  hasItem: {
    validate(node, path) {
      validateEntityRef(node.ref, `${path}.ref`);
    },
    evaluate(node, ctx) {
      return countInventoryMatching(ctx.state, ctx.registry, node.ref) >= (node.ref.count ?? node.count ?? 1);
    },
  },
  zoneDiscovered: {
    validate(node, path) {
      assert(node.ref && typeof node.ref.id === "string", `${path}.ref.id is required`);
    },
    evaluate(node, ctx) {
      return ctx.state.discoveredZones.includes(node.ref.id);
    },
  },
  flag: {
    validate(node, path) {
      assert(typeof node.id === "string", `${path}.id is required`);
    },
    evaluate(node, ctx) {
      return !!ctx.state.flags[node.id] === (node.value ?? true);
    },
  },
  facilityBuilt: {
    validate(node, path) {
      assert(node.ref && typeof node.ref.id === "string", `${path}.ref.id is required`);
    },
    evaluate(node, ctx) {
      return ctx.state.builtFacilities.includes(node.ref.id);
    },
  },
  doomAtLeast: {
    validate(node, path) {
      assert(typeof node.value === "number", `${path}.value is required and must be a number`);
    },
    evaluate(node, ctx) {
      return ctx.state.doom >= node.value;
    },
  },
  workersAssigned: {
    validate(node, path) {
      assert(node.ref && typeof node.ref.id === "string", `${path}.ref.id is required`);
      if (node.count !== undefined) assert(typeof node.count === "number", `${path}.count must be a number`);
    },
    evaluate(node, ctx) {
      const assigned = ctx.state.workers.assignments[node.ref.id] ?? 0;
      return assigned >= (node.count ?? 1);
    },
  },
};

export function validateRequirementNode(node, path = "requirements") {
  if (node == null) return;
  assert(typeof node === "object" && !Array.isArray(node), `${path} must be an object`);
  assert(typeof node.type === "string", `${path}.type is required`);
  const handler = REQUIREMENT_HANDLERS[node.type];
  assert(handler, `${path}: unknown requirement type "${node.type}"`);
  handler.validate(node, path);
}

/** ctx: { state, registry } */
export function evaluateRequirement(node, ctx) {
  if (node == null) return true;
  const handler = REQUIREMENT_HANDLERS[node.type];
  if (!handler) throw new Error(`Unknown requirement type "${node.type}" encountered at runtime`);
  return handler.evaluate(node, ctx);
}
