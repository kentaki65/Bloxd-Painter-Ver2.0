export const blockColors: Record<number, string> = {
  0: "transparent",   // Air
  2: "#8B5A2B",        // Dirt
  4: "#5A8F3C",        // Grass Block
  5: "#DBC98F",        // Sand
  28: "#8A8A8A",        // Stone
  126: "#7976B9",
  650: "#C56321",
  1629: "#E5F5FF",
  1955: "#2A9E19"
};

export function getColor(blockId: number): string {
  return blockColors[blockId] ?? "#FF00FF";
}