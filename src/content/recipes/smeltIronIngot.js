export const smeltIronIngot = {
  id: "smelt_iron_ingot",
  type: "recipe",
  name: "Smelt Iron Ingot",
  description: "Melt down raw iron into a usable ingot.",
  tags: ["smithing"],
  inputs: [{ id: "raw_iron", count: 2 }],
  outputs: [{ id: "iron_ingot", count: 1 }],
  craftTicks: 3,
};
