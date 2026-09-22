import { BiomeConstructorOptions, BlockMetadata, BlockName, Seed } from "@/core/types.js";
import { Biome } from "./Biome.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";
import { getBlockId } from "@/utils/utils.js";
import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";

export interface CustomBiomeDefinition {
  frequency: number;

  topSoilBlockName: BlockName; // surface/topsoil?
  lowerSoilBlockName: BlockName; // lower soil?

  XI: {
    blockName: BlockName;
    frequency: number;
  }[];
}

export class CustomBiome extends Biome {
  constructor(
    chunkSize: number, 
    blockMetadata: BlockMetadata, 
    worldGenerator: WorldGenerator, 
    seed: Seed, 
    options: BiomeConstructorOptions, 
    surfacePrefabDensitySetting: CustomBiomeDefinition
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}Custom_${surfacePrefabDensitySetting.topSoilBlockName}_${surfacePrefabDensitySetting.lowerSoilBlockName}`, options);
    this.grassChance = 0;
    this.tallGrassChance = 0;
    this.mapleTreeChance = 0;
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.flowerPatchDistApart = null;
    this.treeMinDist = null;
    this.topsoilBlockType = getBlockId(surfacePrefabDensitySetting.topSoilBlockName, blockMetadata);
    this.lowsoilBlockType = getBlockId(surfacePrefabDensitySetting.lowerSoilBlockName, blockMetadata);
    this._heightmapSimplex = new SimpleOctavesNoise([{
      amplitude: 4,
      frequency: 1 / 70
    }, {
      amplitude: 2,
      frequency: 1 / 30
    }], `${seed}CustomBiomeHeightMap`);
  }
}