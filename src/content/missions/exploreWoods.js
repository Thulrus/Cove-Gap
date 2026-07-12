export const exploreWoods = {
  id: "explore_woods",
  type: "mission",
  name: "Explore the Woods",
  description: "Send workers on explorer duty out to scout beyond the fence line.",
  tags: ["exploration"],
  roleId: "explorer",
  workerCost: { min: 1, max: 2 },
  durationTicks: 5,
  effects: [
    { type: "modifyResource", ref: { id: "wood" }, amount: 5 },
    { type: "modifyResource", ref: { id: "food" }, amount: 3 },
  ],
};
