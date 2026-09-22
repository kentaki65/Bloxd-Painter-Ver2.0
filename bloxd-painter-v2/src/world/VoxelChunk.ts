import ndarray from "ndarray";
import { chunkSize } from "../core/types";

export class VoxelChunk {
  readonly cx: number;
  readonly cy: number;
  readonly cz: number;
  private array;

  constructor(cx: number, cy: number, cz: number) {
    this.cx = cx; this.cy = cy; this.cz = cz;
    this.array = ndarray(new Int16Array(chunkSize ** 3), [chunkSize, chunkSize, chunkSize]);
  }

  getLocal(lx: number, ly: number, lz: number): number {
    return this.array.get(lx, ly, lz);
  }

  setLocal(lx: number, ly: number, lz: number, value: number): void {
    this.array.set(lx, ly, lz, value);
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.array.data.length; i++) {
      //unloadedのid
      if (this.array.data[i] !== 1) return false;
    }
    return true;
  }
}