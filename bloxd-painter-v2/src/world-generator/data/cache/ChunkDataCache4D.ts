import type { Vec2 } from "../../core/types.js";
import { Sparse4DArray } from "../array/Sparse4DArray.js";
import { ChunkArray4D } from "../array/ChunkArray4D.js";
import { emptyArray, HeightField } from "../../core/constants.js";
import { CombinedArray4D } from "../array/CombinedArray4D.js";
import { CaveGeneratorManager } from "../../structures/cave/CaveGeneratorManager.js";

//型修正必要
export class ChunkDataCache4D {
  outerSparseArray: Sparse4DArray;
  innerContiguousArray: ChunkArray4D;
  generator: CaveGeneratorManager;

  constructor(innerContiguousArray: ChunkArray4D, generator: CaveGeneratorManager) {
    this.innerContiguousArray = innerContiguousArray;
    this.generator = generator;
    this.outerSparseArray = new Sparse4DArray();
  }

  static create(
    size: number,
    chunkBottomLeft: Vec2,
    numCaveTypes: number,
    dimension4: HeightField,
    generator: CaveGeneratorManager
  ) {
    const innerArray = new ChunkArray4D(size, chunkBottomLeft, numCaveTypes, dimension4);

    for (let x = chunkBottomLeft[0]; x < chunkBottomLeft[0] + size; x++) {
      for (let y = chunkBottomLeft[1]; y < chunkBottomLeft[1] + size; y++) {
        generator.generateAndSet(x, y, innerArray);
      }
    }
    return new ChunkDataCache4D(innerArray, generator);
  }

  getOrGenerate(x: number, y: number, z: number, d: number) {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y, z, d);
    }
    
    const value = this.outerSparseArray.get(x, y, z, d);
    if (value !== undefined) {
      return value;
    }

    this.generator.generateAndSet(x, y, this.outerSparseArray);
    return this.outerSparseArray.get(x, y, z, d);
  }

  viewJustInnerChunk() {
    return new CombinedArray4D(emptyArray, this.innerContiguousArray);
  }
}