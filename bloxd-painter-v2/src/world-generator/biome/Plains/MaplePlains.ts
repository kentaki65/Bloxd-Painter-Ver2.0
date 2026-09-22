import { FeatureHeight } from "../../core/constants.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { Plains } from "./Plains.js";
import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class MaplePlains extends Plains {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(FeatureHeight.MEDIUM, [{
      prefabName: "treeMapleLarge1",
      frequency: 6
    }, {
      prefabName: "treeMapleLarge2",
      frequency: 9
    }]));
    this.grassChance = 0.12;
    this.tallGrassChance = 0.24;
    this.cornChance = 0.00025;
    this.flowerPatchDistApart = 5;
  }
}