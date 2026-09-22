import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { Forest } from "./Forest.js";
import { FeatureHeight } from "../../core/constants.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class Jungle extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(FeatureHeight.HIGH, [{
      prefabName: "treeJungleLarge1",
      frequency: 20
    }, {
      prefabName: "treeJungleLarge2",
      frequency: 20
    }, {
      prefabName: "rockJungleLarge1",
      frequency: 8
    }, {
      prefabName: "rockJungleLarge2",
      frequency: 8
    }, {
      prefabName: "rockJungleLarge3",
      frequency: 8
    }, {
      prefabName: "rockJungleLarge4",
      frequency: 8
    }, {
      prefabName: "rockJungleLarge5",
      frequency: 8
    }, {
      prefabName: "rockJungleLarge6",
      frequency: 8
    }]));
    this.minDistanceFromOrigin = 200;
    this.grassChance = 0.01;
    this.tallGrassChance = 0.02;
    this.jungleTallGrassChance = 0.04;
    this.catnipChance = 0.02;
    this.flowerPatchDistApart = 12;
    this.melonChance = 0;
    this.fatRedMushroomChance = 12;
    this.fatBrownMushroomChance = 12;
    this.aspenTreeChance = 0;
    this.mapleTreeChance = 0;
    this.jungleTreeChance = 10;
    this.palmTreeChance = 2;
    this.mangoTreeChance = 2;
    this.topsoilBlockType = blockMetadata["Jungle Grass Block"].id;
  }
}