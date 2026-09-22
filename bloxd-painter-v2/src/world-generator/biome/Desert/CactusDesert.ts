import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { Desert } from "./Desert.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class CactusDesert extends Desert {
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

    this.cactusChance = 0.05;
  }
}