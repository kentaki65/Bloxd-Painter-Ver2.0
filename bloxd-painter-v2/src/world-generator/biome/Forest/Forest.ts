import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import { prefabGroupsFrequencies } from "@/structures/prefab/prefabDatas/prefabFrequencies.js";
import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { FeatureHeight } from "@/core/constants.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class Forest extends Biome {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
    surfacePrefabDensitySetting = createPrefabFrequencySettings(FeatureHeight.MEDIUM, prefabGroupsFrequencies.ruins, prefabGroupsFrequencies.trees)
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}Forest`, options, surfacePrefabDensitySetting);
    this.mapleTreeChance = 15;
    this.aspenTreeChance = 1;
    this.flowerPatchDistApart = 28;
    this.redMushroomChance = 8;
    this.brownMushroomChance = 8;
    this.fatRedMushroomChance = 8;
    this.fatBrownMushroomChance = 8;
    this.melonChance = 30;
    this.topsoilBlockType = blockMetadata["Grass Block"].id;
    this.lowsoilBlockType = blockMetadata.Dirt.id;
    this.treeMinDist = 6;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 4,
      frequency: 1 / 70
    }, {
      amplitude: 2,
      frequency: 1 / 30
    }], `${seed}ForestBiomeHeightMap`);
  }
}