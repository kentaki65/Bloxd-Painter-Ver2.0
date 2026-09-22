import { BlockMetadata, ChunkArray, ClusterConfig, ClusterSettingsResult, Seed } from "@/core/types.js";
import { PointsGenerator } from "@/generator/PointsGenerator.js";
import { createClusterSettings, selectAvailableOffset } from "./CaveUtils.js";
import { CaveDataProvider } from "./CaveDataProvider.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { interpolateClusterValue } from "@/utils/mathHelper.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";
import { CaveDataView } from "./CaveDataViewer.js";

interface ClusterCell {
  x: number;
  y: number;
  z: number;
  blockId: number;
}

function isInsideDecoratableCave(
  x: number,
  y: number,
  z: number,
  caveDataProvider: CaveDataProvider
) {
  const caveIntervals = caveDataProvider.getDecoratableCaves(x, z);

  for (const caveInterval of caveIntervals) {
    if (y >= caveInterval.floorY && y <= caveInterval.ceilingY) {
      return true;
    }
  }

  return false;
}

export class CaveDecorationGenerator {
  chunkSize: number;
  seed: Seed;
  pointsGen: PointsGenerator;
  configs: ClusterSettingsResult[];
  maxHalfBox: number;

  constructor(
    blockMetadata: BlockMetadata,
    chunkSize: number,
    seed: Seed,
    clusterConfigs: ClusterConfig[] | null = null
  ) {
    this.chunkSize = chunkSize;
    this.seed = seed;

    const configs = createClusterSettings(blockMetadata, clusterConfigs);

    let maxHalfBox = 0;
    let totalPeakChance = 0;

    for (const config of configs) {
      if (
        !Number.isInteger(config.clusterBoxSize) ||
        config.clusterBoxSize < 2 ||
        config.clusterBoxSize % 2 !== 0
      ) {
        throw new Error(
          `Decoration kind "${config.seedPrefix}" has invalid clusterBoxSize (${config.clusterBoxSize}); must be an even integer >= 2 (the 2x2x2-cell scatter scheme needs at least one cell per axis).`
        );
      }

      const halfBox = config.clusterBoxSize >> 1;

      if (halfBox > maxHalfBox) {
        maxHalfBox = halfBox;
      }

      totalPeakChance += Math.max(
        config.minChance,
        config.maxChance ?? config.minChance
      );
    }

    if (totalPeakChance > 1) {
      throw new Error(
        `Cave decoration cluster chances sum to ${totalPeakChance} at peak depth; must not exceed 1 (later configs would be silently squeezed).`
      );
    }

    this.pointsGen = new PointsGenerator("caveDeco", 10, false, true, seed, 4, chunkSize, null, true);

    this.pointsGen.assertReachableFromChunkCentre(
      chunkSize,
      maxHalfBox
    );

    this.configs = configs;
    this.maxHalfBox = maxHalfBox;
  }

  getDecorationsForChunkColumn(
    chunkX: number,
    chunkZ: number,
    heightmapVals: ChunkDataCache3D,
    chunkHeight: CaveDataView
  ):ClusterCell[] {
    const decorations: ClusterCell[] = [];
    const chunkSize = this.chunkSize;
    const chunkEndX = chunkX + chunkSize;
    const chunkEndZ = chunkZ + chunkSize;

    const caveDataProvider = new CaveDataProvider(heightmapVals, chunkHeight, 4, 3);

    const centreX = chunkX + (chunkSize >> 1);
    const centreZ = chunkZ + (chunkSize >> 1);

    const points = this.pointsGen.getPointsAroundPoint(
      centreX,
      centreZ
    );

    const maxHalfBox = this.maxHalfBox;

    for (const point of points) {
      const pointX = point[0];
      const pointZ = point[1];

      if (
        !(pointX + maxHalfBox <= chunkX) &&
        !(pointX - maxHalfBox >= chunkEndX) &&
        !(pointZ + maxHalfBox <= chunkZ) &&
        !(pointZ - maxHalfBox >= chunkEndZ)
      ) {
        this.collectClusterPlacements(
          pointX,
          pointZ,
          chunkX,
          chunkEndX,
          chunkZ,
          chunkEndZ,
          caveDataProvider,
          decorations
        );
      }
    }

    return decorations;
  }

  static addCaveDecorationsToChunk(
    chunk: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    chunkHeight: number,
    decorations: ClusterCell[]
  ) {
    const chunkEndY = chunkStartY + chunkHeight;

    for (const decoration of decorations) {
      if (
        decoration.y >= chunkStartY &&
        decoration.y < chunkEndY
      ) {
        chunk.set(
          decoration.x - chunkStartX,
          decoration.y - chunkStartY,
          decoration.z - chunkStartZ,
          decoration.blockId
        );
      }
    }
  }

  collectClusterPlacements(
    x: number,
    z: number,
    chunkStartX: number,
    chunkEndX: number,
    chunkStartZ: number,
    chunkEndZ: number,
    caveDataProvider: CaveDataProvider,
    decorations: ClusterCell[]
  ) {
    const caveIntervals = caveDataProvider.getDecoratableCaves(x, z);

    if (caveIntervals.length === 0) {
      return;
    }

    const rng = new SeededRandom(`${this.seed}|${x}|${z}|cluster`);

    const caveIntervalRoll = rng.next();
    const yRoll = rng.next();
    const decorationRoll = rng.next();

    const caveInterval =
      caveIntervals[Math.floor(caveIntervalRoll * caveIntervals.length)];

    const y =
      caveInterval.floorY +
      Math.floor(
        yRoll * (caveInterval.ceilingY - caveInterval.floorY + 1)
      );

    let cumulativeChance = 0;
    let selectedConfig = null;

    for (const config of this.configs) {
      cumulativeChance += interpolateClusterValue(config, y);

      if (decorationRoll < cumulativeChance) {
        selectedConfig = config;
        break;
      }
    }

    if (selectedConfig === null) {
      return;
    }

    const clusterCells: any = [];

    this.scatterClusterCells(
      x,
      y,
      z,
      selectedConfig,
      caveDataProvider,
      rng,
      clusterCells
    );

    if (clusterCells.length < selectedConfig.minClusterCells) {
      return;
    }

    for (const cell of clusterCells) {
      if (
        cell.x >= chunkStartX &&
        cell.x < chunkEndX &&
        cell.z >= chunkStartZ &&
        cell.z < chunkEndZ
      ) {
        decorations.push(cell);
      }
    }
  }

  scatterClusterCells(
    x: number,
    y: number,
    z: number,
    config: any,
    caveDataProvider: CaveDataProvider,
    rng: SeededRandom,
    clusterCells: ClusterCell[]
  ) {
    const { clusterBoxSize, yI, anchorOptions } = config;

    const halfBox = clusterBoxSize >> 1;
    const startX = x - halfBox;
    const startY = y - halfBox;
    const startZ = z - halfBox;

    for (let offsetX = 0; offsetX < halfBox; offsetX++) {
      for (let offsetY = 0; offsetY < halfBox; offsetY++) {
        for (let offsetZ = 0; offsetZ < halfBox; offsetZ++) {
          const spawnRoll = rng.next();
          const offsetRoll = rng.next();
          const anchorRoll = rng.next();

          if (spawnRoll >= yI) {
            continue;
          }

          const offsetIndex = Math.floor(offsetRoll * 8);

          const cellX = startX + offsetX * 2 + (offsetIndex & 1);
          const cellY = startY + offsetY * 2 + ((offsetIndex >> 1) & 1);
          const cellZ = startZ + offsetZ * 2 + ((offsetIndex >> 2) & 1);

          if (!isInsideDecoratableCave(cellX, cellY, cellZ, caveDataProvider)) {
            continue;
          }

          const anchor = selectAvailableOffset(
            cellX,
            cellY,
            cellZ,
            anchorOptions,
            anchorRoll,
            caveDataProvider
          );

          if (anchor !== null) {
            clusterCells.push({
              x: cellX,
              y: cellY,
              z: cellZ,
              blockId: anchor.blockId
            });
          }
        }
      }
    }
  }
}