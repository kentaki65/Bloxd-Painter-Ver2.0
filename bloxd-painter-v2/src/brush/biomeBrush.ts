// src/brush/biomeBrush.ts
import { VoxelWorld } from "../world/VoxelWorld";
import { BiomeOverrideLayer } from "../world/overrideLayers/BiomeOverrideLayer";
import { getCirclePoints } from "./circleBrush";
import { regenerateAffectedChunks } from "../world/regenerate";
import { BRUSH_RADIUS } from "../core/types";

export function applyBiomeBrush(
  world: VoxelWorld,
  generator: any,
  biomeOverrideLayer: BiomeOverrideLayer,
  centerX: number,
  centerZ: number,
  biomeId: number,
  chunkYCount: number,
  chunkYStart: number
): void {
  const points = getCirclePoints(centerX, centerZ, BRUSH_RADIUS);

  for (const [x, z] of points) {
    biomeOverrideLayer.set(x, z, biomeId);
  }

  regenerateAffectedChunks(world, generator, points, chunkYCount, chunkYStart);
}