// Base entity shape shared by every content type, plus a small per-type
// extension validator for the handful of first-class relationship fields
// each type needs (recipe.inputs/outputs, monster.weaknesses, ...).
//
// Adding a new content type = one entry in CONTENT_TYPES + one validator
// function here. Adding a new *entity* of an existing type never touches
// this file at all.

import { assert, assertArray, assertPositiveNumber } from "./validationUtils.js";
import { validateEntityRef } from "./refs.js";
import { validateRequirementNode } from "./requirements.js";
import { validateEffectNode } from "./effects.js";

export const CONTENT_TYPES = ["resource", "item", "monster", "zone", "recipe", "quest", "lore", "defense"];

function validateResourceFields(entity, path) {
  if (entity.baseProduction !== undefined) {
    assert(typeof entity.baseProduction === "number", `${path}.baseProduction must be a number`);
  }
  if (entity.startingAmount !== undefined) {
    assert(typeof entity.startingAmount === "number", `${path}.startingAmount must be a number`);
  }
}

function validateItemFields(entity, path) {
  if (entity.slot !== undefined) assert(typeof entity.slot === "string", `${path}.slot must be a string`);
  if (entity.stackable !== undefined) assert(typeof entity.stackable === "boolean", `${path}.stackable must be a boolean`);
  if (entity.value !== undefined) assert(typeof entity.value === "number", `${path}.value must be a number`);
  if (entity.startingAmount !== undefined) {
    assert(typeof entity.startingAmount === "number", `${path}.startingAmount must be a number`);
  }
}

function validateMonsterFields(entity, path) {
  assert(entity.combat && typeof entity.combat === "object", `${path}.combat is required`);
  for (const key of ["health", "attack", "defense"]) {
    assert(typeof entity.combat[key] === "number", `${path}.combat.${key} must be a number`);
  }
  if (entity.weaknesses !== undefined) {
    assertArray(entity.weaknesses, `${path}.weaknesses`);
    entity.weaknesses.forEach((ref, i) => validateEntityRef(ref, `${path}.weaknesses[${i}]`));
  }
  if (entity.resistances !== undefined) {
    assertArray(entity.resistances, `${path}.resistances`);
    entity.resistances.forEach((ref, i) => validateEntityRef(ref, `${path}.resistances[${i}]`));
  }
}

function validateZoneFields(entity, path) {
  assert(typeof entity.dangerLevel === "number", `${path}.dangerLevel is required and must be a number`);
  if (entity.monsters !== undefined) {
    assertArray(entity.monsters, `${path}.monsters`);
    entity.monsters.forEach((ref, i) => validateEntityRef(ref, `${path}.monsters[${i}]`));
  }
}

function validateRecipeFields(entity, path) {
  assertArray(entity.inputs, `${path}.inputs`);
  entity.inputs.forEach((ref, i) => validateEntityRef(ref, `${path}.inputs[${i}]`));
  assertArray(entity.outputs, `${path}.outputs`);
  assert(entity.outputs.length > 0, `${path}.outputs must have at least one entry`);
  entity.outputs.forEach((ref, i) => validateEntityRef(ref, `${path}.outputs[${i}]`));
  if (entity.craftTicks !== undefined) assertPositiveNumber(entity.craftTicks, `${path}.craftTicks`);
}

function validateQuestFields(entity, path) {
  assertArray(entity.stages, `${path}.stages`);
  assert(entity.stages.length > 0, `${path}.stages must have at least one stage`);
  entity.stages.forEach((stage, i) => {
    const stagePath = `${path}.stages[${i}]`;
    assert(typeof stage.id === "string", `${stagePath}.id is required`);
    assert(typeof stage.description === "string", `${stagePath}.description is required`);
    if (stage.requirements !== undefined) validateRequirementNode(stage.requirements, `${stagePath}.requirements`);
    if (stage.effects !== undefined) {
      assertArray(stage.effects, `${stagePath}.effects`);
      stage.effects.forEach((effect, j) => validateEffectNode(effect, `${stagePath}.effects[${j}]`));
    }
  });
}

function validateLoreFields(entity, path) {
  assert(typeof entity.text === "string" && entity.text.length > 0, `${path}.text is required`);
}

function validateDefenseFields(entity, path) {
  assert(typeof entity.defenseValue === "number", `${path}.defenseValue is required and must be a number`);
  if (entity.upkeep !== undefined) {
    assertArray(entity.upkeep, `${path}.upkeep`);
    entity.upkeep.forEach((u, i) => {
      assert(u.ref && typeof u.ref.id === "string", `${path}.upkeep[${i}].ref.id is required`);
      assert(typeof u.amount === "number", `${path}.upkeep[${i}].amount must be a number`);
    });
  }
}

const TYPE_VALIDATORS = {
  resource: validateResourceFields,
  item: validateItemFields,
  monster: validateMonsterFields,
  zone: validateZoneFields,
  recipe: validateRecipeFields,
  quest: validateQuestFields,
  lore: validateLoreFields,
  defense: validateDefenseFields,
};

export function validateEntity(entity, path) {
  assert(entity && typeof entity === "object", `${path}: entity must be an object`);
  assert(typeof entity.id === "string" && entity.id.length > 0, `${path}: "id" is required and must be a non-empty string`);
  assert(CONTENT_TYPES.includes(entity.type), `${path} (${entity.id}): "type" must be one of ${CONTENT_TYPES.join(", ")}`);
  assert(typeof entity.name === "string" && entity.name.length > 0, `${path} (${entity.id}): "name" is required`);
  assert(typeof entity.description === "string", `${path} (${entity.id}): "description" is required`);

  if (entity.tags !== undefined) {
    assertArray(entity.tags, `${path} (${entity.id}).tags`);
    entity.tags.forEach((tag, i) => assert(typeof tag === "string", `${path} (${entity.id}).tags[${i}] must be a string`));
  }
  if (entity.requirements !== undefined) {
    validateRequirementNode(entity.requirements, `${path} (${entity.id}).requirements`);
  }
  if (entity.effects !== undefined) {
    assertArray(entity.effects, `${path} (${entity.id}).effects`);
    entity.effects.forEach((effect, i) => validateEffectNode(effect, `${path} (${entity.id}).effects[${i}]`));
  }

  TYPE_VALIDATORS[entity.type](entity, `${path} (${entity.id})`);
}
