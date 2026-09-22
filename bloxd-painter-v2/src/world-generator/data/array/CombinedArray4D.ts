import { ChunkArray4D } from "./ChunkArray4D.js";
import { EmptyArray } from "./types.js";

export class CombinedArray4D {
  outerSparseArray: typeof EmptyArray;
  innerContiguousArray: ChunkArray4D;

  constructor(outerSparseArray: typeof EmptyArray, innerContiguousArray: ChunkArray4D) {
    this.outerSparseArray = outerSparseArray;
    this.innerContiguousArray = innerContiguousArray;
  }

  get(x: number, y: number, z: number, d: number) {
    if (this.innerContiguousArray.isInBounds(x, y)) {
      return this.innerContiguousArray.get(x, y, z, d);
    }

    const value = this.outerSparseArray.get(x, y, z, d);

    if (value === undefined) {
      throw new Error(
        `Number not found for x=${x}, y=${y}, z=${z}, d=${d}`
      );
    }

    return value;
  }
}