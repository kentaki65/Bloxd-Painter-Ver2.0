import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { Forest } from "./Forest.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { FeatureHeight } from "@/core/constants.js";
import { forestPrefabsFrequencies } from "@/structures/prefab/prefabDatas/prefabFrequencies.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class PineForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
    surfacePrefabDensitySetting = createPrefabFrequencySettings(
      FeatureHeight.MEDIUM, 
      forestPrefabsFrequencies.ruins, 
      forestPrefabsFrequencies.trees
    )
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, surfacePrefabDensitySetting);
    this.minDistanceFromOrigin = 200;
    this.grassChance = 0;
    this.tallGrassChance = 0;
    this.pineGrassChance = 0.02;
    this.pineFernChance = 0.01;
    this.flowerPatchDistApart = 15;
    this.melonChance = 0;
    this.fallenPineConeChance = 250;
    this.mapleTreeChance = 0;
    this.aspenTreeChance = 0;
    this.pineTreeChance = 15;
    this.cedarTreeChance = 1;
    this.cranberryChance = 1;
    this.topsoilBlockType = blockMetadata["Pine Grass Block"].id;
  }
}