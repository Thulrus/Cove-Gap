// Aggregates all content by type and feeds sim/content/registry.js.
// To add a new entity: create its file in the matching folder, then add it
// to that folder's index.js array. No engine code changes required.

import { resources } from "./resources/index.js";
import { items } from "./items/index.js";
import { monsters } from "./monsters/index.js";
import { zones } from "./zones/index.js";
import { recipes } from "./recipes/index.js";
import { quests } from "./quests/index.js";
import { lore } from "./lore/index.js";
import { defenses } from "./defenses/index.js";

export const contentByType = {
  resource: resources,
  item: items,
  monster: monsters,
  zone: zones,
  recipe: recipes,
  quest: quests,
  lore,
  defense: defenses,
};
