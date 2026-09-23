// src/brush/heightBrush.ts
import { VoxelWorld } from "../world/VoxelWorld";
import { HeightOverrideLayer } from "../world/overrideLayers/HeightOverrideLayer";
import { getCirclePoints } from "./circleBrush";
import { regenerateAffectedChunks } from "../world/regenerate";
import { BRUSH_RADIUS } from "../core/types";

export function applyHeightBrush(
  world: VoxelWorld,
  generator: any,
  heightOverrideLayer: HeightOverrideLayer,
  centerX: number,
  centerZ: number,
  height: number,
  chunkYCount: number,
  chunkYStart: number
): void {
  const points = getCirclePoints(centerX, centerZ, BRUSH_RADIUS);

  for (const [x, z] of points) {
    heightOverrideLayer.set(x, z, height);
  }

  regenerateAffectedChunks(world, generator, points, chunkYCount, chunkYStart);
}