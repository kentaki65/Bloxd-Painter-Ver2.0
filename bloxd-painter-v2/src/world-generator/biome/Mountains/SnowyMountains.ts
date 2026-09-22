import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { Biome } from "../Biome.js";
import { getTotalAmplitude } from "@/utils/mathHelper.js";
import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class SnowyMountains extends Biome {
  private ridgedNoiseOctave1: SimpleOctavesNoise;
  private ridgedNoiseOctave2: SimpleOctavesNoise;
  private nonRidgedNoise: SimpleOctavesNoise;
  private ridgedNoiseAmplitude: number;
  
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}SnowyMountains`, options);

    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.grassChance = 0;
    this.tallGrassChance = 0;
    this.treeMinDist = 50;
    this.offsettedHeight = 0;

    this.ridgedNoiseOctave1 = new SimpleOctavesNoise([{
      amplitude: 80,
      frequency: 0.005
    }], `${seed}SnowyMountainsBiomeRidgedNoise`);

    this.ridgedNoiseOctave2 = new SimpleOctavesNoise([{
      amplitude: 20,
      frequency: 1 / 120
    }], `${seed}SnowyMountainsBiomeRidgedNoiseOctave2`);

    this.nonRidgedNoise = new SimpleOctavesNoise([{
      amplitude: 8,
      frequency: 1 / 120
    }], `${seed}SnowyMountainsBiomeNonRidgedNoise`);

    this.ridgedNoiseAmplitude =
      getTotalAmplitude(this.ridgedNoiseOctave1) +
      getTotalAmplitude(this.ridgedNoiseOctave2);
  }

  getHeightmapVal(x: number, z: number) {
    const ridgeHeight =
      this.ridgedNoiseAmplitude -
      Math.abs(this.ridgedNoiseOctave1.getOctaves(x, z)) -
      Math.abs(this.ridgedNoiseOctave2.getOctaves(x, z));

    return this.offsettedHeight + ridgeHeight + this.nonRidgedNoise.getOctaves(x, z);
  }

  getTopsoilBlock(x: number, y: number, z: number) {
    if (y > 80) {
      return this.blockMetadata.Snow.id;
    } else if (y > 60) {
      return this.blockMetadata.Stone.id;
    } else {
      return this.blockMetadata["Grass Block"].id;
    }
  }

  getLowsoilBlockType(x: number, y: number, z: number, height: number) {
    if (y > 85 && y >= height - 2) {
      return this.blockMetadata.Snow.id;
    } else if (y > 57) {
      return this.blockMetadata.Stone.id;
    } else if (y > 53) {
      return this.blockMetadata["Rocky Dirt"].id;
    } else {
      return this.blockMetadata.Dirt.id;
    }
  }
}