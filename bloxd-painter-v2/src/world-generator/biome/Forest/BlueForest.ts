import type { BiomeConstructorOptions, BlockMetadata, Seed } from "../../core/types.js";
import { Forest } from "./Forest.js";
import { WorldGenerator } from "../../generator/WorldGenerator.js";

export class BlueForest extends Forest {
  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions
  ) {
    super(chunkSize, blockMetadata, worldGenerator, `${seed}Blue`, options);
    this.bluebellChance = 10;
    this.melonChance = 0;
    this.flowerPatchDistApart = 12;
    this.poppyChance = 0;
    this.daisyChance = 0;
    this.pinkTulipChance = 0;
    this.redMushroomChance = 0;
    this.fatRedMushroomChance = 0;
    this.fatBrownMushroomChance = 0;
    this.brownMushroomChance = 0;
  }
}