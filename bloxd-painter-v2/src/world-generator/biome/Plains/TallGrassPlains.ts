import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { Plains } from "./Plains.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class TallGrassPlains extends Plains {
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
    this.grassChance = 0.06;
    this.tallGrassChance = 0.12;
  }
}