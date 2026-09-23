import { VoxelChunk } from "./VoxelChunk";
import { chunkSize } from "../core/types";

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export class VoxelWorld {
  private chunks = new Map<string, VoxelChunk>();
  private key = (cx: number, cy: number, cz: number) => `${cx},${cy},${cz}`;

  getChunk(cx: number, cy: number, cz: number): VoxelChunk | undefined {
    return this.chunks.get(this.key(cx, cy, cz));
  }

  getOrCreateChunk(cx: number, cy: number, cz: number): VoxelChunk {
    const key = this.key(cx, cy, cz);
    let chunk = this.chunks.get(key);
    if (chunk === undefined) {
      chunk = new VoxelChunk(cx, cy, cz);
      this.chunks.set(key, chunk);
    }
    return chunk;
  }

  getBlock(x: number, y: number, z: number): number {
    const chunk = this.getChunk(floorDiv(x, chunkSize), floorDiv(y, chunkSize), floorDiv(z, chunkSize));
    if (chunk === undefined) {
      return 1;
    }
    return chunk.getLocal(mod(x, chunkSize), mod(y, chunkSize), mod(z, chunkSize));
  }

  setBlock(x: number, y: number, z: number, value: number): void {
    const chunk = this.getOrCreateChunk(floorDiv(x, chunkSize), floorDiv(y, chunkSize), floorDiv(z, chunkSize));
    chunk.setLocal(mod(x, chunkSize), mod(y, chunkSize), mod(z, chunkSize), value);
  }

  getChunkCount(): number {
    return this.chunks.size;
  }

  findTopBlock(x: number, z: number, maxY = 120, minY = -100): { y: number; blockId: number } | null {
    for (let y = maxY; y >= minY; y--) {
      const b = this.getBlock(x, y, z);
      if (b !== 0) return { y, blockId: b }; // 0 = Air
    }
    return null;
  }
}