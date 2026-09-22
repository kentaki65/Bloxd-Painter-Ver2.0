import { ChunkSize, FixedPrefabField, HeightField } from "@/core/constants.js";
import { FixedPointPrefabInfo, Schematic } from "@/core/types.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";
import { lobbySchematic } from "@/schematics/datas/lobbySchematic.js";
import { divideByChunkSize } from "@/utils/mathHelper.js";
import { isNullOrUndefined } from "@/utils/utils.js";
import { TTLCache } from "@isaacs/ttlcache";
import ndarray from "ndarray";
import voxelCrunch from 'voxel-crunch';
import { FixedPointPrefabChunkHeightGenerator } from "./FixedPointPrefabChunkHeightGenerator.js";

const vI = 12

type FixedPointPrefabName = keyof typeof lobbySchematic;

export interface DecodedFixedPointPrefabInfo {
  decodedPrefabSchematic: any;
  bottomLeftX: number;
  bottomLeftZ: number;
  floorY: number;
  ceilingY: number;
  topRightX: number;
  topRightZ: number;
}

interface FixedPointPrefabInfoForChunk {
  decodedFixedPointPrefabsForChunk: DecodedFixedPointPrefabInfo[];
  nearestFixedPrefabInfoForChunk: ChunkDataCache3D | null;
}

export class FixedPointPrefabManager {
  chunkSize: number;
  chunkToFixedPointPrefabs: Record<string, FixedPointPrefabInfo[]>;

  static DECODED_FIXED_POINT_PREFAB_SCHEMATIC_CACHE = new TTLCache({
    max: 100,
    ttl: 60000,
    updateAgeOnGet: true
  });

  constructor(
    fixedPointPrefabs: Array<{
      prefabName: FixedPointPrefabName;
      x: number;
      y: number;
      z: number;
    }>,
    chunkSize: number
  ) {
    this.chunkSize = chunkSize;
    this.chunkToFixedPointPrefabs = {};

    const chunkToFixedPointPrefabs: Record<string, FixedPointPrefabInfo[]> = {};

    const maxDistance = chunkSize + vI;

    for (const { prefabName, x, y, z } of fixedPointPrefabs) {
      const schematic = lobbySchematic[prefabName];

      if (schematic === undefined) {
        throw new Error(
          `Fixed-point prefab "${prefabName}" has not been inlined into the build using the BloxdSchematicInliner tool.`
        );
      }

      const { dimensions } = schematic;

      const width = dimensions.x;
      const height = dimensions.y;
      const depth = dimensions.z;

      const bottomLeftX = x - (width >> 1);
      const bottomLeftZ = z - (depth >> 1);

      const topRightX = bottomLeftX + width - 1;
      const topRightZ = bottomLeftZ + depth - 1;

      const prefabInfo: FixedPointPrefabInfo = {
        schematic,
        bottomLeftX,
        bottomLeftZ,
        floorY: y,
        ceilingY: y + height - 1,
        topRightX,
        topRightZ
      };

      const minX = bottomLeftX - maxDistance;
      const maxX = topRightX + maxDistance;
      const minZ = bottomLeftZ - maxDistance;
      const maxZ = topRightZ + maxDistance;

      const startChunkX = Math.floor(minX / chunkSize) * chunkSize;
      const startChunkZ = Math.floor(minZ / chunkSize) * chunkSize;

      for (let chunkX = startChunkX; chunkX <= maxX; chunkX += chunkSize) {
        for (let chunkZ = startChunkZ; chunkZ <= maxZ; chunkZ += chunkSize) {
          const key = this.getKeyForChunk(chunkX, chunkZ);

          if (chunkToFixedPointPrefabs[key] === undefined) {
            chunkToFixedPointPrefabs[key] = [];
          }

          chunkToFixedPointPrefabs[key].push(prefabInfo);
        }
      }
    }

    this.chunkToFixedPointPrefabs = chunkToFixedPointPrefabs;
  }

  getFixedPointPrefabInfoForChunk(
    chunkX: number,
    chunkZ: number
  ): FixedPointPrefabInfoForChunk  {
    const key = this.getKeyForChunk(chunkX, chunkZ);
    const prefabInfos = this.chunkToFixedPointPrefabs[key];

    if (prefabInfos === undefined) {
      return {
        decodedFixedPointPrefabsForChunk: [],
        nearestFixedPrefabInfoForChunk: null
      };
    }

    const decodedFixedPointPrefabsForChunk = [];

    for (const prefabInfo of prefabInfos) {
      const {
        schematic,
        bottomLeftX,
        bottomLeftZ,
        floorY,
        ceilingY,
        topRightX,
        topRightZ
      } = prefabInfo;

      const decodedPrefabSchematic = this.getDecodedPrefabSchematic(schematic);

      decodedFixedPointPrefabsForChunk.push({
        decodedPrefabSchematic,
        bottomLeftX,
        bottomLeftZ,
        floorY,
        ceilingY,
        topRightX,
        topRightZ
      });
    }

    const nearestFixedPrefabInfoForChunk = new FixedPointPrefabChunkHeightGenerator(prefabInfos);

    return {
      decodedFixedPointPrefabsForChunk,
      nearestFixedPrefabInfoForChunk: ChunkDataCache3D.create(
        this.chunkSize,
        [chunkX, chunkZ],
        HeightField.NumFields,
        nearestFixedPrefabInfoForChunk
      )
    };
  }

  static smoothHeightmapForFixedPointPrefab(
    x: number,
    z: number,
    height: number,
    fixedPrefabInfo: ChunkDataCache3D | null
  ) {
    if (fixedPrefabInfo === null) {
      return null;
    }

    const distance = fixedPrefabInfo.getOrGenerate(x, z, FixedPrefabField.DistanceToNearestFixedPrefab);

    if (distance > vI) {
      return null;
    }

    let weight = distance / vI;
    weight *= weight;

    const prefabHeight = fixedPrefabInfo.getOrGenerate(x, z, FixedPrefabField.HeightOfNearestFixedPrefab);

    return Math.floor(height * weight + (1 - weight) * prefabHeight);
  }

  static isNearFixedPointPrefab(
    x: number,
    z: number,
    fixedPrefabInfo: ChunkDataCache3D | null
  ): boolean {
    if (fixedPrefabInfo === null) {
      return false;
    }

    return (
      fixedPrefabInfo.getOrGenerate(
        x,
        z,
        FixedPrefabField.DistanceToNearestFixedPrefab
      ) <= vI
    );
  }

  static isWithinFixedPointPrefab(
    x: number,
    z: number,
    fixedPrefabInfo: ChunkDataCache3D | null
  ): boolean {
    if (fixedPrefabInfo === null) {
      return false;
    }

    return (
      fixedPrefabInfo.getOrGenerate(
        x,
        z,
        FixedPrefabField.DistanceToNearestFixedPrefab
      ) === 0
    );
  }

  static getBlockFromFixedPointPrefab(
    x: number,
    y: number,
    z: number,
    prefabInfo: DecodedFixedPointPrefabInfo
  ): number {
    const { bottomLeftX, bottomLeftZ, floorY, ceilingY, topRightX, topRightZ } = prefabInfo;

    if (
      x < bottomLeftX ||
      topRightX < x ||
      y < floorY ||
      ceilingY < y ||
      z < bottomLeftZ ||
      topRightZ < z
    ) {
      return 0;
    }

    const localX = x - bottomLeftX;
    const localY = y - floorY;
    const localZ = z - bottomLeftZ;

    return prefabInfo.decodedPrefabSchematic.get(
      localX,
      localY,
      localZ
    );
  }

  getKeyForChunk(chunkX: number, chunkZ: number): string {
    return `${chunkX}|${chunkZ}`;
  }

  getDecodedPrefabSchematic(schematic: Schematic) {
    const name = schematic.name;

    const cachedSchematic = FixedPointPrefabManager.DECODED_FIXED_POINT_PREFAB_SCHEMATIC_CACHE.get(name);

    if (!isNullOrUndefined(cachedSchematic)) {
      return cachedSchematic;
    }

    const { dimensions } = schematic;

    const decodedSchematic = ndarray(
      new Uint16Array(
        dimensions.x * dimensions.y * dimensions.z
      ),
      [dimensions.x, dimensions.y, dimensions.z]
    );

    for (let x = 0; x < dimensions.x; x += ChunkSize) {
      for (let y = 0; y < dimensions.y; y += ChunkSize) {
        for (let z = 0; z < dimensions.z; z += ChunkSize) {
          const decodedChunk = ndarray(
            new Uint16Array(32768),
            [ChunkSize, ChunkSize, ChunkSize]
          );

          const rleChunk = schematic.getRLEChunk(
            divideByChunkSize(x),
            divideByChunkSize(y),
            divideByChunkSize(z)
          );

          voxelCrunch.decode(rleChunk, decodedChunk.data);

          const width = Math.min(ChunkSize, dimensions.x - x);
          const height = Math.min(ChunkSize, dimensions.y - y);
          const depth = Math.min(ChunkSize, dimensions.z - z);

          for (let localX = 0; localX < width; localX++) {
            for (let localY = 0; localY < height; localY++) {
              for (let localZ = 0; localZ < depth; localZ++) {
                const block = decodedChunk.get(
                  localX,
                  localY,
                  localZ
                );

                const worldX = x + localX;
                const worldY = y + localY;
                const worldZ = z + localZ;

                decodedSchematic.set(
                  worldX,
                  worldY,
                  worldZ,
                  block
                );
              }
            }
          }
        }
      }
    }

    FixedPointPrefabManager.DECODED_FIXED_POINT_PREFAB_SCHEMATIC_CACHE.set(
      name,
      decodedSchematic
    );

    return decodedSchematic;
  }
}