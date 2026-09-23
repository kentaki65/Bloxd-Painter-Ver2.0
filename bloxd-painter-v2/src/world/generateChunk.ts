import ndarray from "ndarray";
import { blockMetadata, WorldGenerator } from "../world-generator/index";
import { chunkSize } from "../core/types";
import type { VoxelWorld } from "./VoxelWorld";
import { BiomeOverrideLayer } from "./overrideLayers/BiomeOverrideLayer";
import type { HeightOverrideLayer } from "./overrideLayers/HeightOverrideLayer";

export function createGenerator(
  seed: string, 
  worldScale = 1, 
  overrideBiome: BiomeOverrideLayer | null= null,
  overrideHeight: HeightOverrideLayer | null = null,
) {
  return new WorldGenerator(chunkSize, blockMetadata, {}, seed, false, [], worldScale, null, overrideBiome, overrideHeight);
}

export function generateAndApplyChunk(
  world: VoxelWorld,
  generator: ReturnType<typeof createGenerator>,
  chunkX: number, chunkY: number, chunkZ: number
) {
  const chunk = ndarray(new Uint16Array(chunkSize ** 3), [chunkSize, chunkSize, chunkSize]);

  generator.getChunk(chunk, chunkX, chunkY, chunkZ);

  const voxelChunk = world.getOrCreateChunk(
    Math.floor(chunkX / chunkSize),
    Math.floor(chunkY / chunkSize),
    Math.floor(chunkZ / chunkSize)
  );

  const data = chunk.data as Uint16Array;

  for (let lx = 0; lx < chunkSize; lx++) {
    for (let ly = 0; ly < chunkSize; ly++) {
      for (let lz = 0; lz < chunkSize; lz++) {
        const idx = lz + ly * chunkSize + lx * chunkSize * chunkSize;
        voxelChunk.setLocal(lx, ly, lz, data[idx]);
      }
    }
  }
}