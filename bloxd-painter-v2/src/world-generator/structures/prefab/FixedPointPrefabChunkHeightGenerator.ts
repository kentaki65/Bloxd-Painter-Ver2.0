import { FixedPrefabField } from "../../core/constants.js";
import type { FixedPointPrefabInfo } from "../../core/types.js";

const vI = 12

export class FixedPointPrefabChunkHeightGenerator {
  fixedPointPrefabsForChunk: FixedPointPrefabInfo[];

  constructor(fixedPointPrefabsForChunk: FixedPointPrefabInfo[]) {
    this.fixedPointPrefabsForChunk = fixedPointPrefabsForChunk;
  }

  generateAndSet(
    x: number,
    z: number,
    heightmap: any
  ): void {
    let distance = vI + 1;
    let floorY = 0;

    for (const prefab of this.fixedPointPrefabsForChunk) {
      const {
        bottomLeftX,
        bottomLeftZ,
        topRightX,
        topRightZ,
      } = prefab;

      const currentDistance =
        Math.max(bottomLeftX - x, 0, x - topRightX) +
        Math.max(bottomLeftZ - z, 0, z - topRightZ);

      if (currentDistance < distance) {
        distance = currentDistance;
        floorY = prefab.floorY;
      }
    }

    heightmap.set(x, z, FixedPrefabField.DistanceToNearestFixedPrefab, distance);
    heightmap.set(x, z, FixedPrefabField.HeightOfNearestFixedPrefab, floorY);
  }
}