import type { Vec2 } from "../../core/types.js";
import ndarray from "ndarray";

export class ChunkArray3D {
  chunkBottomLeft: Vec2;
  chunkTopRight: Vec2;
  array;

  constructor(size: number, chunkBottomLeft: Vec2, dimension3: number) {
    this.chunkBottomLeft = chunkBottomLeft;

    this.chunkTopRight = [
      this.chunkBottomLeft[0] + size - 1,
      this.chunkBottomLeft[1] + size - 1
    ];

    this.array = ndarray(new Int16Array(size * size * dimension3), [size, size, dimension3]);
  }

  isInBounds(x: number, y: number): boolean {
    return (
      x >= this.chunkBottomLeft[0] &&
      x <= this.chunkTopRight[0] &&
      y >= this.chunkBottomLeft[1] &&
      y <= this.chunkTopRight[1]
    );
  }

  set(x: number, y: number, z: number, value: number
  ): void {
    this.array.set(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1],
      z,
      value
    );
  }

  get(x: number, y: number, z: number): number {
    return this.array.get(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1],
      z
    );
  }
}