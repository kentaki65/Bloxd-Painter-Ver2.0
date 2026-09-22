import { BiomeConstructorOptions, BlockMetadata, Seed } from "@/core/types.js";
import { PineForest } from "./PineForest.js";
import { WorldGenerator } from "@/generator/WorldGenerator.js";

export class SnowyPineForest extends PineForest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, seed, options);
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.redMushroomChance = 0;
    this.brownMushroomChance = 0;
    this.fatRedMushroomChance = 0;
    this.fatBrownMushroomChance = 0;
    this.cranberryChance = 10;
    this.fallenPineConeChance = 5;
    this.pineGrassChance = 0.004;
    this.pineFernChance = 0.001;
    this.topsoilBlockType = blockMetadata.Snow.id;
    this.topwaterBlockType = blockMetadata.Ice.id;
  }
}