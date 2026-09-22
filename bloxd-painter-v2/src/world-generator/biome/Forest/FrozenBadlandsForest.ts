import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { Forest } from "./Forest.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { FeatureHeight } from "@/core/constants.js";
import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class FrozenBadlandsForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(FeatureHeight.HIGH, [{
      prefabName: "treeSpectralLarge1",
      frequency: 8
    }, {
      prefabName: "treeSpectralLarge2",
      frequency: 8
    }, {
      prefabName: "rockSnowLarge1",
      frequency: 4
    }, {
      prefabName: "rockSnowLarge2",
      frequency: 4
    }, {
      prefabName: "rockSnowLarge3",
      frequency: 4
    }, {
      prefabName: "ruinSnowSmall1",
      frequency: 6
    }, {
      prefabName: "ruinSnowSmall2",
      frequency: 6
    }, {
      prefabName: "ruinSnowSmall3",
      frequency: 6
    }, {
      prefabName: "ruinSnowSmall4",
      frequency: 6
    }, {
      prefabName: "ruinSnowMedium1",
      frequency: 4
    }, {
      prefabName: "ruinSnowMedium2",
      frequency: 4
    }, {
      prefabName: "ruinSnowLarge1",
      frequency: 3
    }, {
      prefabName: "ruinSnowLarge2",
      frequency: 3
    }]));
    this.minDistanceFromOrigin = 400;
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.grassChance = 0;
    this.tallGrassChance = 0;
    this.forgetMeNotChance = 0;
    this.whiteTulipChance = 0;
    this.orangeTulipChance = 0;
    this.redTulipChance = 0;
    this.dandelionChance = 0;
    this.alliumChance = 0;
    this.watermelonChance = 0;
    this.riceChance = 0;
    this.cranberryChance = 0;
    this.cottonChance = 0;
    this.melonChance = 0;
    this.redMushroomChance = 0;
    this.fatRedMushroomChance = 0;
    this.brownMushroomChance = 0;
    this.fatBrownMushroomChance = 0;
    this.mapleTreeChance = 0;
    this.aspenTreeChance = 0;
    this.flowerPatchDistApart = 35;
    this.spectralGrassChance = 0.08;
    this.spectralTreeChance = 8;
    this.shadowRoseChance = 8;
    this.topsoilBlockType = blockMetadata["Packed Snow"].id;
    this.lowsoilBlockType = blockMetadata.Snow.id;
    this.topwaterBlockType = blockMetadata.Ice.id;
    this.treeMinDist = 7;
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 3,
      frequency: 1 / 70
    }, {
      amplitude: 1,
      frequency: 1 / 30
    }], `${seed}FrozenBadlandsForestHeightMap`);
  }
}