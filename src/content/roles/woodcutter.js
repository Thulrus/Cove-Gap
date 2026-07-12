export const woodcutter = {
  id: "woodcutter",
  type: "role",
  name: "Woodcutter",
  description: "Cuts timber from the edges of the forest. No facility needed.",
  tags: ["labor"],
  produces: [{ ref: { id: "wood" }, amountPerWorker: 1 }],
};
