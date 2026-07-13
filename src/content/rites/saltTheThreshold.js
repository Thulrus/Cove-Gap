export const saltTheThreshold = {
  id: "salt_the_threshold",
  type: "rite",
  name: "Salting the Threshold",
  description: "The Brotherhood salts every doorframe in town at each new moon.",
  tags: ["rite"],
  cost: [{ ref: { id: "food" }, amount: 3 }],
  effect: { aspectRef: { id: "water_hollow" }, doomDelta: 6 },
  misunderstanding:
    "Believed to ward off wandering spirits of the drowned dead. It isn't spirits, and it was never dead — but the salt line holds anyway.",
};
