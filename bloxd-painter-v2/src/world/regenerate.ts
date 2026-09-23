// src/world/regenerate.ts
import { VoxelWorld } from "./VoxelWorld";
import { generateAndApplyChunk } from "./generateChunk";
import { chunkSize } from "../core/types";

export function regenerateAffectedChunks(
  world: VoxelWorld,
  generator: any,
  points: Array<[number, number]>,
  chunkYCount: number,
  chunkYStart: number
): void {
  const affectedChunkXZ = new Set<string>();

  for (const [x, z] of points) {
    const cx = Math.floor(x / chunkSize) * chunkSize;
    const cz = Math.floor(z / chunkSize) * chunkSize;
    affectedChunkXZ.add(`${cx},${cz}`);
  }

  for (const key of affectedChunkXZ) {
    const [cx, cz] = key.split(",").map(Number);

    generator.mostRecentlyAccessedChunkColumn = null;
    generator.chunkColumnInfos.delete(`${cx}|${cz}`);

    for (let cy = 0; cy < chunkYCount; cy++) {
      generateAndApplyChunk(world, generator, cx!, chunkYStart + cy * chunkSize, cz!);
    }
  }
}