import { blockMetadata, WorldGenerator } from "../world-generator/index";
import { chunkSize } from "../core/types";
import { BiomeOverrideLayer } from "./overrideLayers/BiomeOverrideLayer";
import type { HeightOverrideLayer } from "./overrideLayers/HeightOverrideLayer";

export function createGenerator(
  seed: string,
  cacheSizeMultiplier = 1,
  overrideBiome: BiomeOverrideLayer | null = null,
  overrideHeight: HeightOverrideLayer | null = null,
) {
  return new WorldGenerator(chunkSize, blockMetadata, {}, seed, false, [], cacheSizeMultiplier, null, overrideBiome, overrideHeight);
}