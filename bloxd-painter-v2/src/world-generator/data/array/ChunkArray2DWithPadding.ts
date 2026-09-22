import type { BiomeGenerateResult } from "../../biome/BiomeSelector.js";
import type { Vec2 } from "../../core/types.js";
import ndarray from "ndarray";

export class ChunkArray2DWithPadding {
  chunkBottomLeft: Vec2;
  chunkTopRight: Vec2;
  needOutsideChunkDist: number;
  array: any;

  constructor(size: number, chunkBottomLeft: Vec2, outsideChunkDistance = 0) {
    this.chunkBottomLeft = chunkBottomLeft;
    this.needOutsideChunkDist = outsideChunkDistance;

    const arraySize = size + 2 * outsideChunkDistance;

    this.chunkTopRight = [
      this.chunkBottomLeft[0] + size - 1,
      this.chunkBottomLeft[1] + size - 1
    ];

    this.array = ndarray(new Array(arraySize * arraySize), [arraySize, arraySize]);
  }

  isInBounds(x: number, y: number): boolean {
    return (
      x >= this.chunkBottomLeft[0] &&
      x <= this.chunkTopRight[0] &&
      y >= this.chunkBottomLeft[1] &&
      y <= this.chunkTopRight[1]
    );
  }

  set(x: number, y: number, value: BiomeGenerateResult[]): void {
    this.array.set(
      x - this.chunkBottomLeft[0] + this.needOutsideChunkDist,
      y - this.chunkBottomLeft[1] + this.needOutsideChunkDist,
      value
    );
  }

  get(x: number, y: number): BiomeGenerateResult[] {
    return this.array.get(
      x - this.chunkBottomLeft[0] + this.needOutsideChunkDist,
      y - this.chunkBottomLeft[1] + this.needOutsideChunkDist
    );
  }
}