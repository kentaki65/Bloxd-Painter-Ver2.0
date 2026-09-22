import { FeatureHeight } from "../../core/constants.js";
import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { Plains } from "./Plains.js";
import { createPrefabFrequencySettings } from "../biomeUtils.js";
import { mapleTreePrefabFrequencies } from "../../structures/prefab/prefabDatas/prefabFrequencies.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class SnowyPlains extends Plains {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options, createPrefabFrequencySettings(FeatureHeight.MEDIUM, mapleTreePrefabFrequencies));
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.grassChance = 0.0009;
    this.tallGrassChance = 0.0001;
    this.forgetMeNotChance = 0;
    this.whiteTulipChance = 0;
    this.orangeTulipChance = 0;
    this.redTulipChance = 0;
    this.dandelionChance = 0;
    this.alliumChance = 0;
    this.watermelonChance = 0;
    this.riceChance = 0;
    this.cranberryChance = 10;
    this.cottonChance = 0;
    this.topsoilBlockType = blockMetadata.Snow.id;
    this.topwaterBlockType = blockMetadata.Ice.id;
  }
}