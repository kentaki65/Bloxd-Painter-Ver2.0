import { CaveField, HeightField, OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { BlockId, BlockMetadata, BlockName, ChunkArray, Seed, Vec2 } from "@/core/types.js";
import { CaveDataView, InnerChunkCaveDataView } from "./CaveDataViewer.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { ChunkDataCache4D } from "@/data/cache/ChunkDataCache4D.js";
import { CaveGeneratorManager } from "./CaveGeneratorManager.js";
import { CaveMetadataManager } from "./CaveMetadataManager.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";

type CaveData = CaveDataView | InnerChunkCaveDataView;

export class CaveManager {
  chunkSize: number;
  caveMetadataForChunkCache;

  constructor(
    seed: Seed,
    chunkSize: number,
    blockMetadata: BlockMetadata,
    BlockName: BlockName | "Lava",
  ) {
    this.chunkSize = chunkSize;
    //洞窟の本体クラス
    this.caveMetadataForChunkCache = new CaveMetadataManager(
      seed,
      chunkSize,
      blockMetadata,
      BlockName
    );
  }

  static isInCave(x: number, y: number, z: number, caveData: CaveData) {
    for (let caveType = 0; caveType < caveData.numCaveTypes; caveType++) {
      const floorY = caveData.getOrGenerate(x, z, caveType, CaveField.FloorY);
      const ceilingY = caveData.getOrGenerate(x, z, caveType, CaveField.CeilingY);
      if (floorY <= y && y <= ceilingY) {
        return true;
      }
    }
    return false;
  }

  //chunkArray, chunkX, minY, chunkZ, groundHeightmap, caveData
  static addCavesToChunk(
    chunkArray: ChunkArray,
    chunkX: number,
    minY: number,
    chunkZ: number,
    groundHeightmap: any,
    caveData: InnerChunkCaveDataView,
  ) {
    const random = new SeededRandom(
      `caveBlocks${chunkX}|${minY}|${chunkZ}`
    );

    for (let x = chunkX; x < chunkX + caveData.chunkSize; x++) {
      for (let z = chunkZ; z < chunkZ + caveData.chunkSize; z++) {
        const groundHeight = groundHeightmap.get(
          x,
          z,
          HeightField.GroundHeight
        );

        for (const caveType of caveData.caveTypePrioritization) {
          const floorY = caveData.getOrGenerate(
            x,
            z,
            caveType,
            CaveField.FloorY
          );
          if (floorY === OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER) {
            continue;
          }
          const ceilingY = caveData.getOrGenerate(
            x,
            z,
            caveType,
            CaveField.CeilingY
          );

          const maxY = Math.min(
            ceilingY + 1,
            minY + caveData.chunkSize,
            groundHeight + 1
          );

          const blockIds = caveData.caveTypeToBlockIds[caveType];

          for (let y = Math.max(floorY, minY); y < maxY; y++) {
            const blockId =
              typeof blockIds === "number"
                ? blockIds
                : blockIds.sample(random);

            chunkArray.set(
              x - chunkX,
              y - minY,
              z - chunkZ,
              blockId
            );
          }
        }
      }
    }
  }


  getCaveHeightmapVals(
    x: number,
    z: number,
    heightmapVals: ChunkDataCache3D
  ) {
    const chunkCoord: Vec2 = [x, z];
    const caveMetadata = new CaveGeneratorManager(
      this.caveMetadataForChunkCache,
      heightmapVals,
      this.chunkSize
    );

    const numCaveTypes = this.caveMetadataForChunkCache.numCaveTypes;
    const caveTypeToBlockIds = this.caveMetadataForChunkCache.caveTypeToBlockId;
    const caveTypePrioritization = this.caveMetadataForChunkCache.caveTypePrioritization;

    const heightmapData = ChunkDataCache4D.create(
      this.chunkSize,
      chunkCoord,
      numCaveTypes,
      HeightField.NumFields,
      caveMetadata
    );

    return new CaveDataView(
      numCaveTypes,
      caveTypeToBlockIds,
      caveTypePrioritization,
      this.chunkSize,
      heightmapData
    );
  }
}