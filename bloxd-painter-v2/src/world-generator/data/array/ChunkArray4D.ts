import { Vec2 } from "@/core/types.js";
import ndarray from "ndarray";

export class ChunkArray4D {
  chunkBottomLeft: Vec2;
  chunkTopRight: Vec2;
  array;

  constructor(size: number, chunkBottomLeft: Vec2, dimension3: number, dimension4: number) {
    this.chunkBottomLeft = chunkBottomLeft;

    this.chunkTopRight = [
      chunkBottomLeft[0] + size - 1,
      chunkBottomLeft[1] + size - 1
    ];

    this.array = ndarray(new Int16Array(size * size * dimension3 * dimension4), [size, size, dimension3, dimension4]);
  }

  isInBounds(x: number, y: number): boolean {
    return (
      x >= this.chunkBottomLeft[0] &&
      x <= this.chunkTopRight[0] &&
      y >= this.chunkBottomLeft[1] &&
      y <= this.chunkTopRight[1]
    );
  }

  set(x: number, y: number, index3: number, index4: number, value: number): void {
    this.array.set(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1],
      index3,
      index4,
      value
    );
  }

  get(x: number, y: number, index3: number, index4: number): number {
    return this.array.get(
      x - this.chunkBottomLeft[0],
      y - this.chunkBottomLeft[1],
      index3,
      index4
    );
  }

  fill(value: number): void {
    const sizeX = this.array.shape[0];
    const sizeY = this.array.shape[1];
    const size3 = this.array.shape[2];
    const size4 = this.array.shape[3];

    if (sizeX === undefined || sizeY === undefined || size3 === undefined || size4 === undefined) {
      return;
    }

    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        for (let index3 = 0; index3 < size3; index3++) {
          for (let index4 = 0; index4 < size4; index4++) {
            this.array.set(x, y, index3, index4, value);
          }
        }
      }
    }
  }
}