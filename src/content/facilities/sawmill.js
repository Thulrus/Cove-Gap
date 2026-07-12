export const sawmill = {
  id: "sawmill",
  type: "facility",
  name: "Sawmill",
  description: "Lets workers be assigned to mill wood into lumber.",
  tags: ["structure", "wood"],
  buildCost: [{ ref: { id: "wood" }, amount: 20 }],
  buildTicks: 5,
};
