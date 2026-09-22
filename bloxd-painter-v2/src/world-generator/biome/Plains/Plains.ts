import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import { BiomeRegion, FeatureHeight } from "@/core/constants.js";
import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { mapleTreePrefabFrequencies, ruinStonePrefabFrequencies } from "@/structures/prefab/prefabDatas/prefabFrequencies.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class Plains extends Biome {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
    surfacePrefabDensitySetting = createPrefabFrequencySettings(FeatureHeight.MEDIUM, ruinStonePrefabFrequencies, mapleTreePrefabFrequencies)
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}Plains`, options, surfacePrefabDensitySetting);
    this.grassChance = 0.162;
    this.tallGrassChance = 0.016;
    this.flowerPatchDistApart = 20;
    this.forgetMeNotChance = 100;
    this.whiteTulipChance = 100;
    this.orangeTulipChance = 100;
    this.redTulipChance = 100;
    this.dandelionChance = 100;
    this.alliumChance = 100;
    this.watermelonChance = 20;
    this.cottonChance = 30;
    this.tags.push(BiomeRegion.PLAINS);
    this.topsoilBlockType = blockMetadata["Grass Block"].id;
    this.lowsoilBlockType = blockMetadata.Dirt.id;
    this.treeMinDist = 75;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 4,
      frequency: 1 / 70
    }, {
      amplitude: 2,
      frequency: 1 / 30
    }], `${seed}PlainsBiomeHeightMap`);
  }
}