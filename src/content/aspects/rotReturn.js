export const rotReturn = {
  id: "rot_return",
  type: "aspect",
  name: "Rot / Return",
  description:
    "Decay as a force, not a tragedy — things that unmake, patiently, because unmaking is also part of growth.",
  tags: ["aspect"],
  signature: {
    combatBias: { attack: "normal", defense: "low" },
    resourceDrain: [{ ref: { id: "wood" }, amountPerTick: 0.2 }],
  },
};
