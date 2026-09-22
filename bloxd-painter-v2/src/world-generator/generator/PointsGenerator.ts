import type { ClosestPoints, Vec2 } from "../core/types.js";
import { PartitionedTTLCache } from "../data/cache/PartitionedTTLCache.js";
import { PartitionTTLCache } from "../data/cache/PartitionTTLCache.js";
import { SeededRandom } from "../noise/SeededRandom.js";
import { getDistance } from "../utils/mathHelper.js";
import PoissonDiskSampling from 'poisson-disk-sampling';

interface PointsGeneratorCell {
  coord: Vec2;
  points: Vec2[] | null;
  pointsSet: Set<string> | undefined;
  surroundingPoints: Vec2[] | null;
}

type GeneratedPoints = {
  pointsSet: Set<string> | undefined;
  points: Vec2[] | null;
};

const pointsGeneratorCache = new PartitionedTTLCache({
  max: 500,
  ttl: 60000,
  updateAgeOnGet: true,
  keySeparator: PartitionedTTLCache.DEFAULT_KEY_SEPARATOR
});

export class PointsGenerator {
  name: string;
  seed: string | number;
  minDist: number;
  cachedCells: PartitionTTLCache<PointsGeneratorCell>;
  _tempCellCoord: Vec2;
  variableDensitySettings: {
    func: (point: Vec2) => number;
    min: number;
    max: number;
  } | null = null;
  useJitteredGrid: boolean;
  customCellGap: number | undefined;
  gridSize: number;
  useIsPoint: boolean;
  useKthClosestPoint: boolean;
  mostRecentlyAccessedCell: PointsGeneratorCell | null;

  constructor(
    name: string,
    minDist: number,
    useIsPoint: boolean,
    useKthClosestPoint: boolean,
    seed: string | number,
    gridSizeMultiplier: number,
    chunkSize: number,
    variableDensitySettings: {
      func: (point: Vec2) => number;
      min: number;
      max: number;
    } | null = null,
    useJitteredGrid = false,
    customCellGap: number | undefined = undefined
  ) {
    this.name = name;
    this.seed = seed;
    this.cachedCells = pointsGeneratorCache.partitionTTLCache();
    this._tempCellCoord = [0, 0];
    this.minDist = minDist;
    this.variableDensitySettings = variableDensitySettings;
    this.customCellGap = customCellGap;
    this.useJitteredGrid = useJitteredGrid;
    this.mostRecentlyAccessedCell = null;

    this.gridSize = Math.floor(
      Math.sqrt(gridSizeMultiplier * Math.pow(minDist, 2))
    );

    if (useJitteredGrid) {
      const remainder = this.gridSize % minDist;

      if (remainder !== 0) {
        this.gridSize += minDist - remainder;
      }
    } else {
      const remainder = this.gridSize % chunkSize;

      if (remainder !== 0) {
        this.gridSize += chunkSize - remainder;
      }
    }

    this.useIsPoint = useIsPoint;
    this.useKthClosestPoint = useKthClosestPoint;
  }

  assertReachableFromChunkCentre(chunkSize: number, halfBox: number): void {
    const requiredGridSize = chunkSize / 2 + halfBox - 1;

    if (this.gridSize < requiredGridSize) {
      throw new Error(
        `PointsGenerator "${this.name}" has gridSize=${this.gridSize} ` +
        `but needs >= ${requiredGridSize} ` +
        `(chunkSize=${chunkSize}, halfBox=${halfBox}). ` +
        `Points near chunk edges would be missed.`
      );
    }
  }

  isPoint(x: number, z: number): boolean {
    const cellCoord = this.getCellCoordFromGlobalCoord(x, z);
    const { pointsSet } = this.getCell(cellCoord[0], cellCoord[1]);

    return !!pointsSet!.has(`${x}|${z}`);
  }

  getClosestPoint(x: number, z: number): Vec2 {
    const cellCoord = this.getCellCoordFromGlobalCoord(x, z);
    const cell = this.getCell(cellCoord[0], cellCoord[1]);
    const surroundingPoints = this._getPointsSurroundingCell(cellCoord, cell);

    let closestPoint: Vec2 = [0, 0];
    let closestDistance = 10000;

    for (const point of surroundingPoints) {
      const distance = getDistance(point, x, z);

      if (distance < closestDistance) {
        closestPoint = point;
        closestDistance = distance;
      }
    }

    return closestPoint;
  }

  getKClosestPointsWithWeights(x: number, z: number, distance: number) {
    const cellCoord = this.getCellCoordFromGlobalCoord(x, z);
    const cell = this.getCell(cellCoord[0], cellCoord[1]);

    this._getPointsSurroundingCell(cellCoord, cell);

    return this._getClosestPointsForGeneratedCell(cell, x, z, distance);
  }

  getPointsAroundPoint(x: number, z: number) {
    const cellCoord = this.getCellCoordFromGlobalCoord(x, z);
    const cell = this.getCell(cellCoord[0], cellCoord[1]);

    return this._getPointsSurroundingCell(cellCoord, cell);
  }

  _getPointsSurroundingCell(cellCoord: Vec2, cell: PointsGeneratorCell) {
    if (!cell.surroundingPoints) {
      const surroundingPoints = [...cell.points!];

      for (let cellX = cellCoord[0] - 1; cellX <= cellCoord[0] + 1; cellX++) {
        for (let cellZ = cellCoord[1] - 1; cellZ <= cellCoord[1] + 1; cellZ++) {
          if (cellCoord[0] !== cellX || cellCoord[1] !== cellZ) {
            surroundingPoints.push(
              ...this.getCell(cellX, cellZ).points!
            );
          }
        }
      }

      cell.surroundingPoints = surroundingPoints;
    }

    return cell.surroundingPoints;
  }

  _getClosestPointsForGeneratedCell(cell: PointsGeneratorCell, x: number, z: number, distance: number) {
    let closestPoint: Vec2 = [0, 0];
    let closestDistance = 100000;

    const surroundingPoints = cell.surroundingPoints!;

    for (const point of surroundingPoints) {
      const pointDistance = getDistance(point, x, z);

      if (pointDistance < closestDistance) {
        closestPoint = point;
        closestDistance = pointDistance;
      }
    }

    const closestPoints: ClosestPoints[] = [{
      pt: closestPoint,
      distDiffFromFirstPt: 0,
      weight: 0
    }];

    let remainingWeight = distance;

    for (let i = 0; i < surroundingPoints.length; i++) {
      const point = surroundingPoints[i]!;

      if (point[0] === closestPoint[0] && point[1] === closestPoint[1]) {
        continue;
      }

      const distanceDifference = getDistance(point, x, z) - closestDistance;

      if (distanceDifference < distance) {
        closestPoints.push({
          pt: point,
          distDiffFromFirstPt: distanceDifference,
          weight: 0
        });

        remainingWeight += distance - distanceDifference;
      }
    }

    for (const point of closestPoints) {
      point.weight = (distance - point.distDiffFromFirstPt) / remainingWeight;
    }

    return closestPoints;
  }

  getCellCoordFromGlobalCoord(x: number, z: number) {
    this._tempCellCoord[0] = Math.floor(x / this.gridSize);
    this._tempCellCoord[1] = Math.floor(z / this.gridSize);

    return this._tempCellCoord;
  }

  getCell(cellX: number, cellZ: number) {
    if (
      this.mostRecentlyAccessedCell &&
      this.mostRecentlyAccessedCell.coord[0] === cellX &&
      this.mostRecentlyAccessedCell.coord[1] === cellZ
    ) {
      return this.mostRecentlyAccessedCell;
    }

    const cellKey = `${cellX}|${cellZ}`;
    const cachedCell = this.cachedCells.get(cellKey);

    if (cachedCell) {
      this.mostRecentlyAccessedCell = cachedCell;
      return cachedCell;
    }

    const { pointsSet, points } = this.generateRandomPointsForCell(cellX, cellZ);

    const cell: PointsGeneratorCell = {
      coord: [cellX, cellZ],
      points,
      pointsSet,
      surroundingPoints: null
    };

    this.cachedCells.set(cellKey, cell);
    this.mostRecentlyAccessedCell = cell;

    return cell;
  }

  generateRandomPointsForCell(cellX: number, cellZ: number): GeneratedPoints {
    const baseX = cellX * this.gridSize;
    const baseZ = cellZ * this.gridSize;

    let points: Vec2[] | null = null;
    let pointsSet: Set<string> | undefined;

    if (this.useJitteredGrid) {
      const random = new SeededRandom(
        `${cellX}${cellZ}${this.seed}jitter`
      );

      points = [];

      const maxX = baseX + this.gridSize;
      const maxZ = baseZ + this.gridSize;

      for (let x = baseX; x < maxX; x += this.minDist) {
        for (let z = baseZ; z < maxZ; z += this.minDist) {
          const jitteredX = x + Math.floor(random.next() * this.minDist);
          const jitteredZ = z + Math.floor(random.next() * this.minDist);

          points.push([jitteredX, jitteredZ]);
        }
      }
    } else {
      const random = new SeededRandom(
        `${cellX}${cellZ}${this.seed}pts`
      );

      const randomFunction = () => random.next();
      let generator;
      const shapeSize = this.gridSize - (this.customCellGap || this.minDist);

      if (this.variableDensitySettings === null) {
        generator = new PoissonDiskSampling(
          {
            shape: [shapeSize, shapeSize],
            minDistance: this.minDist,
            maxDistance: this.minDist,
            tries: 40
          },
          randomFunction
        );
      } else {
        const minDistance = this.variableDensitySettings.min;
        const maxDistance = this.variableDensitySettings.max;
        const distanceRange = maxDistance - minDistance;
        const densityFunction = this.variableDensitySettings.func;

        const distanceFunction = (point: number[]) =>
          (densityFunction([
            point[0]! + baseX,
            point[1]! + baseZ
          ]) - minDistance) / distanceRange;

        generator = new PoissonDiskSampling(
          {
            shape: [shapeSize, shapeSize],
            minDistance,
            maxDistance,
            tries: 10,
            distanceFunction
          },
          randomFunction
        );
      }

      points = generator
        .fill()
        .map((point): Vec2 => [
          Math.floor(baseX + point[0]!),
          Math.floor(baseZ + point[1]!)
        ]);
    }

    if (this.useIsPoint) {
      pointsSet = new Set<string>();

      for (const point of points) {
        pointsSet.add(`${point[0]}|${point[1]}`);
      }
    }

    return {
      pointsSet,
      points: this.useKthClosestPoint ? points : null
    };
  }
}