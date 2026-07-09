export const strangerAtTheTreeline = {
  id: "stranger_at_the_treeline",
  type: "quest",
  name: "The Stranger at the Treeline",
  description: "A gaunt traveler warns of something living in Widow Creek.",
  tags: ["intro"],
  stages: [
    {
      id: "find_widow_creek",
      description: "Discover Widow Creek.",
      requirements: { type: "zoneDiscovered", ref: { id: "widow_creek" } },
      effects: [
        { type: "grantItem", ref: { id: "torch" }, count: 1 },
        { type: "setFlag", id: "met_stranger", value: true },
      ],
    },
  ],
};
