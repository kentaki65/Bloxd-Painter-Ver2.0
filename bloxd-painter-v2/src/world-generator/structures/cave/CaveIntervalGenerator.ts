import { CaveDataView } from "./CaveDataViewer.js";
import { getCaveIntervals } from "./CaveUtils.js";

export class CaveIntervalGenerator {
  caveHeightmapVals: CaveDataView;

  constructor(caveHeightmapVals: CaveDataView) {
    this.caveHeightmapVals = caveHeightmapVals;
  }

  generate(x: number, z: number) {
    return getCaveIntervals(x, z, this.caveHeightmapVals, false);
  }
}