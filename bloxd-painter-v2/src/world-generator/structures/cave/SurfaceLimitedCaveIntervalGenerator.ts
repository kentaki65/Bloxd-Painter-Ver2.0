import { HeightField } from "@/core/constants.js";
import { getCaveIntervals } from "./CaveUtils.js";
import { CaveDataView } from "./CaveDataViewer.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";

export class SurfaceLimitedCaveIntervalGenerator {
  caveHeightmapVals: CaveDataView;
  heightmapVals: ChunkDataCache3D;
  surfaceMargin: number;
  minCaveHeight: number;

  constructor(
    caveHeightmapVals: CaveDataView,
    heightmapVals: ChunkDataCache3D,
    surfaceMargin: number,
    minCaveHeight: number
  ) {
    this.caveHeightmapVals = caveHeightmapVals;
    this.heightmapVals = heightmapVals;
    this.surfaceMargin = surfaceMargin;
    this.minCaveHeight = minCaveHeight;
  }

  generate(x: number, z: number) {
    const caveIntervals = getCaveIntervals(x, z, this.caveHeightmapVals, true);

    if (caveIntervals.length === 0) {
      return caveIntervals;
    }

    const surfaceCeilingY =
      this.heightmapVals.getOrGenerate(x, z, HeightField.GroundHeight) -
      this.surfaceMargin;

    const result = [];

    for (const caveInterval of caveIntervals) {
      const ceilingY = Math.min(caveInterval.ceilingY, surfaceCeilingY);

      if (!(ceilingY - caveInterval.floorY + 1 < this.minCaveHeight)) {
        result.push(
          ceilingY === caveInterval.ceilingY
            ? caveInterval
            : {
                floorY: caveInterval.floorY,
                ceilingY
              }
        );
      }
    }

    return result;
  }
}