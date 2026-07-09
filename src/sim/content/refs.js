// EntityRef is the one relationship primitive used across all content:
// { id: "iron_ingot" }        -> points at one specific entity
// { tag: "iron", count: 2 }   -> points at any entity carrying a tag
//
// This is what lets a monster's weakness reference a trait instead of a
// concrete item id: add a new item with that tag later and it just works.

import { assert, assertPositiveNumber } from "./validationUtils.js";

export function validateEntityRef(ref, path) {
  assert(ref && typeof ref === "object", `${path} must be an object`);
  const hasId = ref.id !== undefined;
  const hasTag = ref.tag !== undefined;
  assert(hasId || hasTag, `${path} must have an "id" or a "tag"`);
  assert(!(hasId && hasTag), `${path} cannot have both "id" and "tag"`);
  if (hasId) assert(typeof ref.id === "string", `${path}.id must be a string`);
  if (hasTag) assert(typeof ref.tag === "string", `${path}.tag must be a string`);
  if (ref.count !== undefined) assertPositiveNumber(ref.count, `${path}.count`);
}

export function describeRef(ref) {
  return ref.id !== undefined ? ref.id : `anything tagged "${ref.tag}"`;
}

export function refMatchesEntity(entity, ref) {
  if (ref.id !== undefined) return entity.id === ref.id;
  return entity.tags?.includes(ref.tag) ?? false;
}

/** Resolves a ref to the entities it points at (0 or 1 for an id ref, 0..n for a tag ref). */
export function resolveRefEntities(registry, type, ref) {
  if (ref.id !== undefined) {
    const entity = registry.tryGetById(type, ref.id);
    return entity ? [entity] : [];
  }
  return registry.byTag(type, ref.tag);
}

/** Sums how many of the referenced item(s) the run currently holds. */
export function countInventoryMatching(state, registry, ref) {
  const matchingIds = new Set(resolveRefEntities(registry, "item", ref).map((item) => item.id));
  let total = 0;
  for (const [itemId, count] of Object.entries(state.inventory)) {
    if (matchingIds.has(itemId)) total += count;
  }
  return total;
}
