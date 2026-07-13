export const burrowGrub = {
  id: "burrow_grub",
  type: "monster",
  name: "Burrow Grub",
  description: "A pale, segmented thing that tunnels up through root cellars.",
  tags: ["burrows", "nocturnal"],
  aspectRef: { id: "growth_root" },
  combat: { health: 20, attack: 8, defense: 2 },
  weaknesses: [{ tag: "fire" }],
};
