import { ChunkArray3D } from "./ChunkArray3D.js";
import { EmptyArray } from "./types.js";

export class CombinedArray3D {
  sparseArray: typeof EmptyArray;
  contiguousArray: ChunkArray3D;

  //型について修正ほしい
  constructor(
    sparseArray: typeof EmptyArray, 
    contiguousArray: ChunkArray3D
  ) {
    this.sparseArray = sparseArray;
    this.contiguousArray = contiguousArray;
  }

  get(x: number, y: number, z: number) {
    if (this.contiguousArray.isInBounds(x, y)) {
      return this.contiguousArray.get(x, y, z);
    }

    const value = this.sparseArray.get(x, y, z);

    if (value === undefined) {
      throw new Error(
        `Number not found for x=${x}, y=${y}, z=${z}`
      );
    }

    return value;
  }
}