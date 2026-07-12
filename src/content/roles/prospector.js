export const prospector = {
  id: "prospector",
  type: "role",
  name: "Prospector",
  description: "Scrapes iron ore from the hillside outcrops. No facility needed.",
  tags: ["labor"],
  produces: [{ ref: { id: "iron" }, amountPerWorker: 0.5 }],
};
