export const hollowBoar = {
  id: "hollow_boar",
  type: "monster",
  name: "the Sow of Widow's Ridge",
  description: "Something with the shape of a boar and the size of a barn, rooting through the dark at the edge of hearing.",
  tags: ["ancient", "relentless"],
  aspectRef: { id: "hunger" },
  combat: { health: 90, attack: 22, defense: 6 },
  weaknesses: [{ tag: "fire" }],
  omenTrack: [
    { doomThreshold: 15, flag: "boar_omen_1" },
    { doomThreshold: 30, flag: "boar_omen_2" },
    { doomThreshold: 45, flag: "boar_omen_3" },
  ],
};
