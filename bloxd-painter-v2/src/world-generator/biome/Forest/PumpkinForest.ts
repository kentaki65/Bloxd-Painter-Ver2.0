import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { Forest } from "./Forest.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class PumpkinForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    biomeOpts: BiomeConstructorOptions
  ) {
    super(
      chunkSize,
      blockMetadata,
      worldGenerator,
      seed,
      biomeOpts
    );
    this.pumpkinChance = 30;
    this.melonChance = 0;
    this.aspenTreeChance = 0;
    this.plumTreeChance = 1;
  }
}