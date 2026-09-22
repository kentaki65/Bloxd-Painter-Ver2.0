import type { Vec3Object } from "../core/types.js";
import { RLEChunkContainer } from "./RLEChunkContainer.js";
import { Sparse3DMap } from "../data/array/Sparse3DMap.js";
import { isNullOrUndefined } from "../utils/utils.js";

export function buildSchematic(
  name: string,
  dimensions: Vec3Object,
  chunks: Array<{
    chunkX: number;
    chunkY: number;
    chunkZ: number;
    rle: Uint8Array;
  }>
): RLEChunkContainer {
  const rleChunkStorage = new Sparse3DMap<Uint8Array>();

  for (const chunk of chunks) {
    if (!isNullOrUndefined(rleChunkStorage.get(chunk.chunkX, chunk.chunkY, chunk.chunkZ))) {
      throw new Error(`Duplicate chunk at ${chunk.chunkX}, ${chunk.chunkY}, ${chunk.chunkZ}`);
    }

    rleChunkStorage.set(
      chunk.chunkX,
      chunk.chunkY,
      chunk.chunkZ,
      chunk.rle
    );
  }

  return new RLEChunkContainer(
    name,
    { x: 0, y: 0, z: 0 },
    dimensions,
    rleChunkStorage
  );
}