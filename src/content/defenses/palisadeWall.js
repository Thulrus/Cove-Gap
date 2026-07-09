export const palisadeWall = {
  id: "palisade_wall",
  type: "defense",
  name: "Palisade Wall",
  description: "A ring of sharpened logs around the town square.",
  tags: ["structure", "wood"],
  defenseValue: 5,
  upkeep: [{ ref: { id: "wood" }, amount: 1 }],
};
