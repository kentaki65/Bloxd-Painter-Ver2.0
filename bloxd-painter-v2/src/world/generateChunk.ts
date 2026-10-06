import ndarray from "ndarray";
import { blockMetadata, WorldGenerator } from "../world-generator/index";
import { chunkSize } from "../core/types";
import type { VoxelWorld } from "./VoxelWorld";
import { BiomeOverrideLayer } from "./overrideLayers/BiomeOverrideLayer";
import type { HeightOverrideLayer } from "./overrideLayers/HeightOverrideLayer";
import type { WorldSettings } from "../ui/components/common/types";

export function createGenerator(
  seed: string,
  cacheSizeMultiplier = 1,
  overrideBiome: BiomeOverrideLayer | null = null,
  overrideHeight: HeightOverrideLayer | null = null,
) {
  return new WorldGenerator(chunkSize, blockMetadata, {}, seed, false, [], cacheSizeMultiplier, null, overrideBiome, overrideHeight);
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

export function generateChunksAsync(
  world: VoxelWorld,
  worldInfo: WorldSettings,
): Promise<void> {
  return new Promise((resolve) => {
    const { seed, chunkX, chunkY, chunkZ } = worldInfo;
    const worker = new Worker(new URL("./generateChunk.worker.ts", import.meta.url), { type: "module" });

    const target = chunkX * chunkY * chunkZ;
    let generated = 0;

    worker.postMessage({ type: "init", seed });

    for (let cx = 0; cx < chunkX; cx++) {
      for (let cy = 0; cy < chunkY; cy++) {
        for (let cz = 0; cz < chunkZ; cz++) {
          worker.postMessage({
            type: "generate",
            chunkX: cx,
            chunkY: cy,
            chunkZ: cz
          })
        }
      }
    }
    
    worker.onmessage = (event) => {
      const { chunkX, chunkY, chunkZ, data } = event.data;
      const voxelChunk = world.getOrCreateChunk(
        Math.floor(chunkX / chunkSize),
        Math.floor(chunkY / chunkSize),
        Math.floor(chunkZ / chunkSize)
      );

      for (let lx = 0; lx < chunkSize; lx++) {
        for (let ly = 0; ly < chunkSize; ly++) {
          for (let lz = 0; lz < chunkSize; lz++) {
            const idx = lz + ly * chunkSize + lx * chunkSize * chunkSize;
            voxelChunk.setLocal(lx, ly, lz, data[idx]);
          }
        }
      }

      generated++;
      if (target === generated) {
        worker.terminate();
        resolve();
      }
    }
  })
}