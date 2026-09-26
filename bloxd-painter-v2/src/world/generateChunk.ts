import ndarray from "ndarray";
import { blockMetadata, WorldGenerator } from "../world-generator/index";
import { chunkSize } from "../core/types";
import type { VoxelWorld } from "./VoxelWorld";
import { BiomeOverrideLayer } from "./overrideLayers/BiomeOverrideLayer";
import type { HeightOverrideLayer } from "./overrideLayers/HeightOverrideLayer";

export function createGenerator(
  seed: string,
  worldScale = 1,
  overrideBiome: BiomeOverrideLayer | null = null,
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

export function generateChunks(
  world: VoxelWorld,
  generator: WorldGenerator,
  chunkX: number,
  chunkY: number,
  chunkZ: number
) {
  for (let cx = 0; cx < chunkX; cx++) {
    for (let cy = 0; cy < chunkY; cy++) {
      for (let cz = 0; cz < chunkZ; cz++) {
        generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
      }
    }
  }
}

//worker化までこれで応急処置
export function generateChunksAsync(
  world: VoxelWorld,
  generator: WorldGenerator,
  chunkX: number,
  chunkY: number,
  chunkZ: number
): Promise<void> {
  return new Promise((resolve) => {
    for (let cx = 0; cx < chunkX; cx++) {
      for (let cy = 0; cy < chunkY; cy++) {
        for (let cz = 0; cz < chunkZ; cz++) {
          generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
        }
      }
    }
    resolve();
  })
}