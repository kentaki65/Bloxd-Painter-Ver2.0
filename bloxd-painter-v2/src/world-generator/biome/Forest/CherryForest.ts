import { FeatureHeight } from "../../core/constants.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { Forest } from "./Forest.js";
import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { prefabGroupsFrequencies } from "../../structures/prefab/prefabDatas/prefabFrequencies.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class CherryForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(
      FeatureHeight.MEDIUM, 
      prefabGroupsFrequencies.trees
    ));
    this.mapleTreeChance = 1;
    this.aspenTreeChance = 1;
    this.cherryTreeChance = 15;
    this.flowerPatchDistApart = 12;
    this.defaultFlowerInsidePatchSpawnChance = 0.4;
    this.defaultFlowerPatchRadius = 10;
    this.fallenCherryLeavesChance = 500;
    this.melonChance = 0;
    this.poppyChance = 0;
    this.daisyChance = 50;
    this.pinkTulipChance = 150;
    this.redMushroomChance = 0;
    this.fatRedMushroomChance = 0;
    this.fatBrownMushroomChance = 0;
    this.brownMushroomChance = 0;
  }
}