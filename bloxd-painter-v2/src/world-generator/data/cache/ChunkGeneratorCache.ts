import { Vec2 } from "@/core/types.js";
import { ChunkArray2DWithPadding } from "../array/ChunkArray2DWithPadding.js";
import { BiomeSelector, BiomeGenerateResult } from "@/biome/BiomeSelector.js";

export class ChunkGeneratorCache {
  innerContiguousArray: ChunkArray2DWithPadding;
  generator: BiomeSelector;
  outerSparseArray: BiomeGenerateResult[][][];

  constructor(
    innerContiguousArray: ChunkArray2DWithPadding,
    generator: BiomeSelector
  ) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = [];
  }

  static create(
    size: number,
    chunkBottomLeft: Vec2,
    generator: BiomeSelector
  ): ChunkGeneratorCache {
    const array = new ChunkArray2DWithPadding(size, chunkBottomLeft);

    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let y = chunkBottomLeft[1]; y < chunkBottomLeft[1] + size; y++) {
        const value = generator.generate(x, y);
        array.set(x, y, value);
      }
    }

    return new ChunkGeneratorCache(array, generator);
  }

  getOrGenerate(x: number, y: number): BiomeGenerateResult[] {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y);
    }
    
    let value = this.outerSparseArray[x]?.[y];
    if (value === undefined) {
      value = this.generator.generate(x, y);
      if (!this.outerSparseArray[x]) {
        this.outerSparseArray[x] = [];
      }
      this.outerSparseArray[x]![y] = value;
    }
    return value;
  }
}