export const widowsRidge = {
  id: "widows_ridge",
  type: "zone",
  name: "Widow's Ridge",
  description: "A high, exposed ridgeline above the creek, rubbed bare in long straight lines no deer ever made.",
  tags: ["ridge", "forest"],
  dangerLevel: 3,
  aspectRef: { id: "hunger" },
  monsters: [{ id: "hollow_boar", requirements: { type: "flag", id: "boar_omen_3", value: true } }],
  requirements: { type: "zoneDiscovered", ref: { id: "widow_creek" } },
};
