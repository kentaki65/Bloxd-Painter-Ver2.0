import * as biome from "../world-generator/biome/index";
import type { BiomeName } from "./types";

export type BiomeRelations = Partial<Record<BiomeName, BiomeName[]>>;

export const biomeRelations: BiomeRelations = ((biomes) => {
  const biomeClasses = Object.values(biomes);
  const basedBiomeClasses = biomeClasses.filter(b => Object.getPrototypeOf(b) === biome.Biome);

  return basedBiomeClasses.reduce<Record<string, string[]>>((acc, cur) => {
    const children: string[] = [];
    biomeClasses.forEach(e => {
      if (Object.getPrototypeOf(e) === cur) {
        children.push(e.name);
      }
    });
    acc[cur.name] = children;
    return acc;
  }, {});
})(biome);

export const biomeBaseRelations: Partial<Record<BiomeName, BiomeName>> = (() => {
  const biomeClasses = Object.entries(biomeRelations);
  return biomeClasses.reduce<Record<string, string>>((acc, [baseBiome, children]) => {
    acc[baseBiome] = baseBiome;
    for (const child of children) {
      acc[child] = baseBiome;
    }
    return acc;
  }, {})
})()

const biomeIcons = import.meta.glob<string>(
  "../assets/biomeIcons/*.png",
  {
    eager: true,
    import: "default",
  }
);

export function getBiomeIcon(name: string) {
  return biomeIcons[`../assets/biomeIcons/${name}.png`];
}