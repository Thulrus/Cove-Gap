export const widowCreek = {
  id: "widow_creek",
  type: "zone",
  name: "Widow Creek",
  description: "The creek bends wrong here, and the water doesn't freeze in winter.",
  tags: ["forest", "water"],
  dangerLevel: 2,
  aspectRef: { id: "water_hollow" },
  monsters: [{ id: "hollow_stalker" }],
  requirements: { type: "zoneDiscovered", ref: { id: "pinewood_hollow" } },
};
