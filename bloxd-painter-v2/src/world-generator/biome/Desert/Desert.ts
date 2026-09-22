import { SimpleOctavesNoise } from "../../noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class Desert extends Biome {
  constructor(
    chunkSize: number, 
    blockMetadata: BlockMetadata, 
    worldGenerator: WorldGenerator, 
    seed: Seed, 
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}Desert`, options);
    this.grassChance = 0;
    this.tallGrassChance = 0;
    this.cactusChance = 0.0006;
    this.flowerPatchDistApart = 200;
    this.chiliPepperChance = 30;
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.treeMinDist = null;
    this.topsoilBlockType = blockMetadata.Sand.id;
    this.lowsoilBlockType = blockMetadata.Sand.id;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 2,
      frequency: 1 / 70
    }, {
      amplitude: 1,
      frequency: 1 / 30
    }], `${seed}DesertBiomeHeightMap`);
  }
}