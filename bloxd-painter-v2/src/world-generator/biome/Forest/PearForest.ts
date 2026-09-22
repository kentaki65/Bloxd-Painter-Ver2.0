import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { Forest } from "./Forest.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class PearForest extends Forest {
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
    this.melonChance = 30;
    this.aspenTreeChance = 0;
    this.pearTreeChance = 1;
  }
}