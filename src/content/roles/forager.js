export const forager = {
  id: "forager",
  type: "role",
  name: "Forager",
  description: "Gathers food from the fields and forest edge. No facility needed.",
  tags: ["labor"],
  produces: [{ ref: { id: "food" }, amountPerWorker: 2 }],
};
