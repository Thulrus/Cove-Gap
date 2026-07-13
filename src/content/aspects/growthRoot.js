export const growthRoot = {
  id: "growth_root",
  type: "aspect",
  name: "Growth / Root",
  description:
    "The woods reclaiming, spreading, absorbing — a barn overtaken in one season that should have taken twenty.",
  tags: ["aspect"],
  signature: {
    combatBias: { attack: "normal", defense: "normal" },
    resourceDrain: [{ ref: { id: "food" }, amountPerTick: 0.3 }],
  },
};
