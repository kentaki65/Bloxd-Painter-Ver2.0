import { Vec2 } from "@/core/types.js";
import ndarray from "ndarray";

export class ChunkArray2D {
  chunkBottomLeft: Vec2;
  array;

  constructor(size: number, chunkBottomLeft: Vec2) {
    this.chunkBottomLeft = chunkBottomLeft;
    this.array = ndarray(new Int16Array(size * size), [size, size]);
  }

  set(x: number, y: number, value: number): void {
    this.array.set(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1],
      value
    );
  }

  get(x: number, y: number): number {
    return this.array.get(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1]
    );
  }
}