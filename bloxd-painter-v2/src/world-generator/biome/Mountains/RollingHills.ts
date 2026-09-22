import { SimpleOctavesNoise } from "../../noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class RollingHills extends Biome {
  constructor(
    chunkSize: number, 
    blockMetadata: BlockMetadata, 
    worldGenerator: WorldGenerator, 
    seed: Seed, 
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}RollingHills`, options);
    this.riceChance = 30;
    this.topsoilBlockType = blockMetadata["Grass Block"].id;
    this.treeMinDist = 25;
    this.offsettedHeight = 20;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 20,
      frequency: 0.005
    }, {
      amplitude: 4,
      frequency: 1 / 70
    }], `${seed}RollingHillsBiomeHeightMap`);
  }
}