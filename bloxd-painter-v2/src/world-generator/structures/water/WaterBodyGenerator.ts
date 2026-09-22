import { BiomeSelector } from "@/biome/BiomeSelector.js";
import { Seed, Vec2 } from "@/core/types.js";
import { PartitionedTTLCache } from "@/data/cache/PartitionedTTLCache.js";
import { PartitionTTLCache } from "@/data/cache/PartitionTTLCache.js";
import { NoWaterHeightmap } from "@/generator/NoWaterHeightmap.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { getClosestPointOnSegment, getDistance, getTotalAmplitude } from "@/utils/mathHelper.js";
import { isNullOrUndefined } from "@/utils/utils.js";

let waterBodyCachePool = null;

interface MaxRiverSettings {
  width: number;
  atFlux: number;
}

interface LakeSettings {
  minRadius: number;
  maxRadius: number;
  maxRadiusAtFlux: number;
  noLakeFluxCutoff: number;
}

interface Uphill {
  incomingFlux: number;
  selfFlux: number;
  origin: Vec2;
  originNoWaterHeight: number;
}

interface Downhill {
  cell: Vec2;
  origin: Vec2 | null;
  originNoWaterHeight: number;
  lakeInfo: LakeInfo;
}

interface WaterBodyInfo {
  origin: Vec2;
  originNoWaterHeight: number;
  downhill: Downhill | null;
  uphills: Uphill[] | null;
  incomingFlux: number | null;
  selfFlux: number;
  lakeInfo: LakeInfo;
}

interface LastReadInfo {
  lastId: string | null;
  info: WaterBodyInfo | null;
}

class LakeInfo {
  hasLake: boolean;
  lakeCreationHasBeenAttempted: boolean;
  lakeWaterHeight: number;
  lakeRadius: number;
  lakeBedHeight: number;

  constructor() {
    this.hasLake = false;
    this.lakeCreationHasBeenAttempted = false;
    this.lakeWaterHeight = 0;
    this.lakeRadius = 0;
    this.lakeBedHeight = 0;
  }
}

export class WaterBodyGenerator {
  biomeSelector: BiomeSelector;
  noWaterHeightmapGenerator: NoWaterHeightmap;
  needOutsideWaterBodyDist: number;
  needsOutsideDist: boolean;
  gridSize: number;
  cellCenterMaxOffset: number;
  maxRiverSettings: MaxRiverSettings;
  lakeSettings: LakeSettings;
  widthOffset: number;
  seed: Seed;
  lakeRadiusNoiseModifier: SimpleOctavesNoise;
  lakeRadiusNoiseAmplitude: number;
  lastReadInfo: LastReadInfo;
  waterBodyInfos: PartitionTTLCache<WaterBodyInfo>;

  constructor(
    biomeSelector: BiomeSelector,
    noWaterHeightmapGenerator: NoWaterHeightmap,
    seed: Seed,
    maxFeatureRadius: number,
    needOutsideWaterBodyDist: number,
    useBiggerCache: boolean,
    needsOutsideDist: boolean,
  ) {
    this.biomeSelector = biomeSelector;
    this.noWaterHeightmapGenerator = noWaterHeightmapGenerator;
    this.needOutsideWaterBodyDist = needOutsideWaterBodyDist;
    this.needsOutsideDist = needsOutsideDist;
    this.gridSize = 224;
    this.maxRiverSettings = {
      width: 23,
      atFlux: 800
    };
    this.lakeSettings = {
      minRadius: 15,
      maxRadius: 60,
      maxRadiusAtFlux: 1700,
      noLakeFluxCutoff: 50
    };
    this.widthOffset = 2;
    this.lastReadInfo = {
      lastId: null,
      info: null
    };

    waterBodyCachePool ||= new PartitionedTTLCache({
      max: useBiggerCache ? 800 : 60,
      ttl: 60000,
      updateAgeOnGet: true,
      keySeparator: PartitionedTTLCache.DEFAULT_KEY_SEPARATOR
    });

    this.waterBodyInfos = waterBodyCachePool.partitionTTLCache();

    const maxCellFeatureExtent = Math.max(
      this.lakeSettings.maxRadius,
      this.maxRiverSettings.width / 2 + this.widthOffset
    ) + needOutsideWaterBodyDist + maxFeatureRadius;

    this.cellCenterMaxOffset = this.gridSize / 2 - maxCellFeatureExtent;

    this.seed = seed;
    this.lakeRadiusNoiseModifier = new SimpleOctavesNoise([
      { amplitude: 10, frequency: 1 / 55 },
      { amplitude: 4, frequency: 0.04 }
    ], `${seed}GlobalHeightmapOffset`);
    this.lakeRadiusNoiseAmplitude = getTotalAmplitude(this.lakeRadiusNoiseModifier);
  }

  getInfoNeededForWaterGen(
    worldX: number,
    worldZ: number
  ) {
    if (!this.needsOutsideDist) {
      return {
        distFromWater: 10000,
        waterRadius: 0,
        waterHeight: 0,
        waterbedHeight: 0,
        isLake: false,
        needOutsideWaterDist: this.needOutsideWaterBodyDist
      };
    }

    const point: Vec2 = [worldX, worldZ];
    const cellInfo = this.getWaterInfo(worldX, worldZ, true);

    let minEdgeDist = 10000;
    let nearestAlongCoord = 0;
    let riverWidth = 0;
    let fluxRatio = 0;
    let fracAlongNearest = 0;
    let originHeightNearest = 0;
    let lakeOrDownstreamHeightNearest = 0;

    if (cellInfo.downhill) {
      const { alongCoord, fracAlong, lineSegmentLength } = getClosestPointOnSegment(point, cellInfo.origin, cellInfo.downhill.origin!);

      nearestAlongCoord = Math.floor(alongCoord);
      let flux = cellInfo.incomingFlux!;
      flux += fracAlong * cellInfo.selfFlux;
      fluxRatio = Math.min(1, flux / this.maxRiverSettings.atFlux);
      riverWidth = Math.max(1, Math.ceil(fluxRatio * this.maxRiverSettings.width));
      minEdgeDist = nearestAlongCoord - riverWidth / 2;
      originHeightNearest = cellInfo.originNoWaterHeight + -3;

      if (cellInfo.downhill.lakeInfo.hasLake) {
        lakeOrDownstreamHeightNearest = cellInfo.downhill.lakeInfo.lakeWaterHeight;
        const distanceIntoLake = lineSegmentLength - cellInfo.downhill.lakeInfo.lakeRadius;
        const distanceAlong = lineSegmentLength * fracAlong;
        fracAlongNearest = Math.min(1, distanceAlong / distanceIntoLake);
      } else {
        lakeOrDownstreamHeightNearest = cellInfo.downhill.originNoWaterHeight + -3;
        fracAlongNearest = fracAlong;
      }
    }

    for (const uphill of cellInfo.uphills!) {
      const { alongCoord, fracAlong, lineSegmentLength } = getClosestPointOnSegment(point, uphill.origin, cellInfo.origin);

      const uphillAlongCoord = Math.floor(alongCoord);
      let flux = uphill.incomingFlux;
      flux += fracAlong * uphill.selfFlux;
      const uphillFluxRatio = Math.min(1, flux / this.maxRiverSettings.atFlux);
      const uphillWidth = Math.max(1, Math.ceil(uphillFluxRatio * this.maxRiverSettings.width));
      const uphillEdgeDist = uphillAlongCoord - uphillWidth / 2;

      if (uphillEdgeDist < minEdgeDist) {
        minEdgeDist = uphillEdgeDist;
        nearestAlongCoord = uphillAlongCoord;
        fluxRatio = uphillFluxRatio;
        riverWidth = uphillWidth;
        originHeightNearest = uphill.originNoWaterHeight + -3;

        if (cellInfo.lakeInfo.hasLake) {
          lakeOrDownstreamHeightNearest = cellInfo.lakeInfo.lakeWaterHeight;
          const distanceIntoLake = lineSegmentLength - cellInfo.lakeInfo.lakeRadius;
          const distanceAlong = lineSegmentLength * fracAlong;
          fracAlongNearest = Math.min(1, distanceAlong / distanceIntoLake);
        } else {
          lakeOrDownstreamHeightNearest = cellInfo.originNoWaterHeight + -3;
          fracAlongNearest = fracAlong;
        }
      }
    }

    if (minEdgeDist !== 10000) {
      let distToLakeEdge = 10000;
      let effectiveLakeRadius = 0;

      if (cellInfo.lakeInfo.hasLake) {
        const lakeInfo = cellInfo.lakeInfo;
        let radiusNoise = this.lakeRadiusNoiseModifier.getOctaves(worldX, worldZ);
        radiusNoise += this.lakeRadiusNoiseAmplitude;
        radiusNoise *= lakeInfo.lakeRadius / this.lakeSettings.maxRadius;
        effectiveLakeRadius = lakeInfo.lakeRadius - radiusNoise;
        distToLakeEdge = getDistance(cellInfo.origin, worldX, worldZ) - effectiveLakeRadius;
      }

      const interpolatedHeight = Math.floor(
        lakeOrDownstreamHeightNearest + (originHeightNearest - lakeOrDownstreamHeightNearest) * (1 - fracAlongNearest)
      );
      const waterbedHeight = interpolatedHeight - (Math.ceil(fluxRatio * 10) + 2);

      if (minEdgeDist < distToLakeEdge) {
        return {
          distFromWater: nearestAlongCoord,
          waterRadius: (riverWidth + this.widthOffset) / 2,
          waterHeight: interpolatedHeight,
          waterbedHeight,
          isLake: false,
          needOutsideWaterDist: this.needOutsideWaterBodyDist
        };
      }

      {
        const distFromLakeOrigin = getDistance(cellInfo.origin, worldX, worldZ);
        const lakeInfo = cellInfo.lakeInfo;
        return {
          distFromWater: distFromLakeOrigin,
          waterRadius: effectiveLakeRadius,
          waterHeight: lakeInfo.lakeWaterHeight,
          waterbedHeight: lakeInfo.lakeBedHeight,
          isLake: true,
          needOutsideWaterDist: this.needOutsideWaterBodyDist
        };
      }
    }

    return {
      distFromWater: 10000,
      waterRadius: 0,
      waterHeight: 0,
      waterbedHeight: 0,
      isLake: false,
      needOutsideWaterDist: this.needOutsideWaterBodyDist
    };
  }

  getWaterInfo(
    worldX: number,
    worldZ: number,
    resolveDownhillLake: boolean
  ) {
    const cellX = Math.floor(worldX / this.gridSize);
    const cellZ = Math.floor(worldZ / this.gridSize);
    const cellInfo = this.getCellInfo(cellX, cellZ);

    if (!cellInfo.uphills) {
      this.fillInUphillInfo(cellX, cellZ, cellInfo);
    }

    if (!cellInfo.downhill && !cellInfo.lakeInfo.lakeCreationHasBeenAttempted) {
      this.fillInLakeInfo(cellInfo);
      cellInfo.lakeInfo.lakeCreationHasBeenAttempted = true;
    }

    if (resolveDownhillLake && cellInfo.downhill) {
      const downhillInfo = this.getWaterInfo(
        cellInfo.downhill.origin![0],
        cellInfo.downhill.origin![1],
        false
      );

      cellInfo.downhill.lakeInfo = downhillInfo.lakeInfo;
    }

    return cellInfo;
  }

  getCellInfo(
    cellX: number,
    cellZ: number
  ): WaterBodyInfo {
    const cellKey = `${cellX}|${cellZ}`;
    if (cellKey === this.lastReadInfo.lastId) {
      return this.lastReadInfo.info!;
    }

    const cachedInfo = this.waterBodyInfos.get(cellKey);
    if (!isNullOrUndefined(cachedInfo)) {
      this.lastReadInfo.lastId = cellKey;
      this.lastReadInfo.info = cachedInfo;
      return cachedInfo;
    }

    const origin = this.getCellOrigin(cellX, cellZ) as Vec2;
    const biome = this.biomeSelector.generate(origin[0], origin[1]);
    const originNoWaterHeight = this.noWaterHeightmapGenerator.getNoWaterHeightmapVal(origin[0], origin[1], biome);

    const newCellInfo = {
      origin,
      originNoWaterHeight,
      downhill: this.getDownhillFromCell(cellX, cellZ, originNoWaterHeight),
      uphills: null,
      incomingFlux: null,
      selfFlux: this.getRainfall(origin[0], origin[1]),
      lakeInfo: new LakeInfo()
    };

    this.lastReadInfo.lastId = cellKey;
    this.lastReadInfo.info = newCellInfo;
    this.waterBodyInfos.set(cellKey, newCellInfo);
    return newCellInfo;
  }

  fillInUphillInfo(
    cellX: number,
    cellZ: number,
    cellInfo: WaterBodyInfo
  ) {
    const uphills = this.getUphillsFromCell(cellX, cellZ);
    let totalIncomingFlux = 0;
    for (const { incomingFlux, selfFlux } of uphills) {
      totalIncomingFlux += incomingFlux + selfFlux;
    }
    cellInfo.uphills = uphills;
    cellInfo.incomingFlux = totalIncomingFlux;
  }

  getUphillsFromCell(
    cellX: number,
    cellZ: number
  ): Uphill[] {
    const uphills: Uphill[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        var downhillCellX;
        var downhillCellZ;
        const neighborCellX = cellX + dx;
        const neighborCellZ = cellZ + dz;
        const manhattanDist = Math.abs(dx) + Math.abs(dz);
        if (manhattanDist === 2 || manhattanDist === 0) {
          continue;
        }

        const neighborCellInfo = this.getCellInfo(neighborCellX, neighborCellZ);
        if (
          ((downhillCellX = neighborCellInfo.downhill) === null || downhillCellX === undefined ? undefined : downhillCellX.cell[0]) === cellX &&
          ((downhillCellZ = neighborCellInfo.downhill) === null || downhillCellZ === undefined ? undefined : downhillCellZ.cell[1]) === cellZ
        ) {
          if (!neighborCellInfo.uphills) {
            this.fillInUphillInfo(neighborCellX, neighborCellZ, neighborCellInfo);
          }
          uphills.push({
            incomingFlux: neighborCellInfo.incomingFlux!,
            selfFlux: neighborCellInfo.selfFlux,
            origin: neighborCellInfo.origin,
            originNoWaterHeight: neighborCellInfo.originNoWaterHeight
          });
        }
      }
    }
    return uphills;
  }

  getDownhillFromCell(
    cellX: number,
    cellZ: number,
    originNoWaterHeight: number
  ) {
    const downhill: Downhill = {
      cell: [0, 0],
      origin: null,
      originNoWaterHeight: 0,
      lakeInfo: new LakeInfo()
    };

    let maxHeightDrop = -1;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const neighborCellX = cellX + dx;
        const neighborCellZ = cellZ + dz;
        const manhattanDist = Math.abs(dx) + Math.abs(dz);
        if (manhattanDist === 2 || manhattanDist === 0) {
          continue;
        }

        const neighborOrigin = this.getCellOrigin(neighborCellX, neighborCellZ) as Vec2;
        const neighborBiome = this.biomeSelector.generate(neighborOrigin[0], neighborOrigin[1]);
        const neighborNoWaterHeight = this.noWaterHeightmapGenerator.getNoWaterHeightmapVal(neighborOrigin[0], neighborOrigin[1], neighborBiome);
        const heightDrop = originNoWaterHeight - neighborNoWaterHeight;

        if (heightDrop > 0 && heightDrop > maxHeightDrop) {
          maxHeightDrop = heightDrop;
          downhill.cell[0] = neighborCellX;
          downhill.cell[1] = neighborCellZ;
          downhill.origin = neighborOrigin;
          downhill.originNoWaterHeight = neighborNoWaterHeight;
        }
      }
    }

    if (maxHeightDrop !== -1) {
      return downhill;
    } else {
      return null;
    }
  }

  getCellOrigin(
    cellX: number,
    cellZ: number
  ) {
    const baseX = cellX * this.gridSize + this.gridSize / 2;
    const baseZ = cellZ * this.gridSize + this.gridSize / 2;
    const rng = new SeededRandom(`${cellX}${cellZ}${this.seed}riverCell`);
    return [
      baseX + Math.floor(rng.next() * this.cellCenterMaxOffset * 2 - this.cellCenterMaxOffset),
      baseZ + Math.floor(rng.next() * this.cellCenterMaxOffset * 2 - this.cellCenterMaxOffset)
    ];
  }

  fillInLakeInfo(
    cellInfo: WaterBodyInfo
  ) {
    const lakeInfo = cellInfo.lakeInfo;
    const totalFlux = cellInfo.incomingFlux! + cellInfo.selfFlux;

    if (totalFlux < this.lakeSettings.noLakeFluxCutoff) {
      return;
    }

    lakeInfo.hasLake = true;
    const fluxRatio = totalFlux / this.lakeSettings.maxRadiusAtFlux;
    const lakeRadius = this.lakeSettings.minRadius + Math.ceil(fluxRatio * (this.lakeSettings.maxRadius - this.lakeSettings.minRadius));
    lakeInfo.lakeRadius = lakeRadius;
    lakeInfo.lakeWaterHeight = Math.floor(cellInfo.originNoWaterHeight - 7);
    const bedDepth = 4 + lakeRadius * 0.35;
    lakeInfo.lakeBedHeight = Math.floor(lakeInfo.lakeWaterHeight - bedDepth);
  }

  getRainfall(
    worldX: number,
    worldZ: number
  ) {
    return 100;
  }
}