import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { Desert } from "./Desert.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class RedDesert extends Desert {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}RedDesert`, options);
    this.chiliPepperChance = 30;
    this.lavaChiliPepperChance = 30;
    this.topsoilBlockType = blockMetadata["Red Sand"].id;
    this.lowsoilBlockType = blockMetadata["Red Sand"].id;
  }
}