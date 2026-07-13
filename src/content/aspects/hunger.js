export const hunger = {
  id: "hunger",
  type: "aspect",
  name: "Hunger",
  description: "Consumption without malice — an appetite older than ethics.",
  tags: ["aspect"],
  signature: {
    combatBias: { attack: "high", defense: "low" },
    resourceDrain: [{ ref: { id: "food" }, amountPerTick: 0.4 }],
  },
};
