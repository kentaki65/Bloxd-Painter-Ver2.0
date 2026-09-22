import { Biome } from "../biome/Biome.js";
import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";

export class NoWaterHeightmap {
  globalHeightmap: SimpleOctavesNoise;

  constructor(globalHeightmap: SimpleOctavesNoise) {
    this.globalHeightmap = globalHeightmap;
  }

  getNoWaterHeightmapVal(
    x: number,
    z: number,
    biomeInfos: { biome: Biome; weight: number }[]
  ): number {
    let height = 0;

    for (const { biome, weight } of biomeInfos) {
      height += biome.getHeightmapVal(x, z) * weight;
    }

    const globalHeight = this.globalHeightmap.getOctaves(x, z);
    return Math.floor(height) + Math.floor(globalHeight);
  }
}