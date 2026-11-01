import type { Vec2 } from "../../core/types.js";
import { ChunkArray2DWithPadding } from "../array/ChunkArray2DWithPadding.js";
import { BiomeSelector } from "../../biome/BiomeSelector.js";
import type { BiomeGenerateResult } from "../../biome/BiomeSelector.js";

export class ChunkGeneratorCache {
  innerContiguousArray: ChunkArray2DWithPadding;
  generator: BiomeSelector;
  outerSparseArray: BiomeGenerateResult[][][];
  useOverride: boolean;

  constructor(
    innerContiguousArray: ChunkArray2DWithPadding,
    generator: BiomeSelector,
    useOverride = true
  ) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = [];
    this.useOverride = useOverride;
  }

  static create(
    size: number,
    chunkBottomLeft: Vec2,
    generator: BiomeSelector,
    useOverride = true
  ): ChunkGeneratorCache {
    const array = new ChunkArray2DWithPadding(size, chunkBottomLeft);

    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let y = chunkBottomLeft[1]; y < chunkBottomLeft[1] + size; y++) {
        array.set(x, y, generator.generate(x, y, useOverride));
      }
    }

    return new ChunkGeneratorCache(array, generator, useOverride);
  }

  getOrGenerate(x: number, y: number): BiomeGenerateResult[] {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y);
    }

    let value = this.outerSparseArray[x]?.[y];
    if (value === undefined) {
      value = this.generator.generate(x, y, this.useOverride);
      if (!this.outerSparseArray[x]) {
        this.outerSparseArray[x] = [];
      }
      this.outerSparseArray[x]![y] = value;
    }
    return value;
  }
}