import { prefabGroupsFrequencies } from "@/structures/prefab/prefabDatas/prefabFrequencies.js";
import { Forest } from "./Forest.js";
import { BiomeRegion, FeatureHeight } from "@/core/constants.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class AutumnForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(FeatureHeight.MEDIUM, prefabGroupsFrequencies.ruins));
    this.flowerPatchDistApart = 13;
    this.fallenMapleLeavesChance = 800;
    this.pumpkinChance = 30;
    this.melonChance = 0;
    this.autumnFernChance = 0.01;
    this.autumnMapleTreeChance = 15;
    this.autumnAspenTreeChance = 1;
    this.mapleTreeChance = 0;
    this.aspenTreeChance = 0;
    this.tags.push(BiomeRegion.AUTUMN);
  }
}