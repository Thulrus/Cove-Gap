export const sawyer = {
  id: "sawyer",
  type: "role",
  name: "Sawyer",
  description: "Mills timber into lumber at the sawmill.",
  tags: ["labor"],
  facilityId: "sawmill",
  produces: [{ ref: { id: "lumber" }, amountPerWorker: 1 }],
};
