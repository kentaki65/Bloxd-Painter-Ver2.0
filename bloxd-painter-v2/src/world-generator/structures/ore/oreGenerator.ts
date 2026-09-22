import { HeightField } from "@/core/constants.js";
import { BlockId, BlockMetadata, BlockName, ChunkArray, Seed } from "@/core/types.js";
import { PointsGenerator } from "@/generator/PointsGenerator.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { manhattanDistance } from "@/utils/mathHelper.js";
import { getBlockId } from "@/utils/utils.js";

export interface OreConfig {
  blockName: BlockName;
  minHeight: number;
  maxHeight: number;
  veinRadius: number;
  placementChance: number;
  minDistanceBetweenOres: number;
}

interface OreType {
  blockId: BlockId;
  veinRadius: number;
  minDistanceBetweenOres: number;
  minHeight: number;
  maxHeight: number;
  placementChance: number;
  pointGenerator: PointsGenerator;
}

export const oreConfigs: OreConfig[] = [{
  blockName: "Moonstone Ore",
  veinRadius: 2,
  minDistanceBetweenOres: 40,
  minHeight: -85,
  maxHeight: -85,
  placementChance: 0.5
}, {
  blockName: "Diamond Ore",
  veinRadius: 2,
  minDistanceBetweenOres: 13,
  minHeight: -100,
  maxHeight: -85,
  placementChance: 0.28
}, {
  blockName: "Gold Ore",
  veinRadius: 2,
  minDistanceBetweenOres: 10,
  minHeight: -100,
  maxHeight: -75,
  placementChance: 0.4
}, {
  blockName: "Iron Ore",
  veinRadius: 2,
  minDistanceBetweenOres: 5,
  minHeight: -80,
  maxHeight: 15,
  placementChance: 0.5
}, {
  blockName: "Coal Ore",
  veinRadius: 3,
  minDistanceBetweenOres: 4,
  minHeight: -60,
  maxHeight: 40,
  placementChance: 0.5
}];

export class OreGenerator {
  seed: Seed;
  chunkSize: number;
  oreTypes: OreType[];

  constructor(
    blockMetadata: BlockMetadata,
    seed: Seed,
    chunkSize: number,
    oreConfigList: OreConfig[]
  ) {
    this.seed = seed;
    this.chunkSize = chunkSize;

    this.oreTypes = oreConfigList.map(oreConfig => {
      const pointGenerator = new PointsGenerator("ore", oreConfig.minDistanceBetweenOres, false, true, `${seed}${oreConfig.blockName}`, 20, chunkSize, null, true);

      pointGenerator.assertReachableFromChunkCentre(
        chunkSize,
        oreConfig.veinRadius
      );

      return {
        blockId: getBlockId(oreConfig.blockName, blockMetadata),
        veinRadius: oreConfig.veinRadius,
        minDistanceBetweenOres: oreConfig.minDistanceBetweenOres,
        minHeight: oreConfig.minHeight,
        maxHeight: oreConfig.maxHeight,
        placementChance: oreConfig.placementChance,
        pointGenerator
      };
    });
  }


  getOreBlocksForChunk(
    chunkStartX: number,
    chunkStartZ: number,
  ) {
    const oreBlocksFlat = [];
    const existenceRng = new SeededRandom(`${chunkStartX}${chunkStartZ}${this.seed}oreExists`);

    for (const oreType of this.oreTypes) {
      const candidatePoints = oreType.pointGenerator.getPointsAroundPoint(chunkStartX + this.chunkSize / 2, chunkStartZ + this.chunkSize / 2);
      const maxXBound = chunkStartX + this.chunkSize + oreType.veinRadius;
      const minXBound = chunkStartX - oreType.veinRadius - 1;
      const maxZBound = chunkStartZ + this.chunkSize + oreType.veinRadius;
      const minZBound = chunkStartZ - oreType.veinRadius - 1;

      for (const veinCentre of candidatePoints) {
        if (veinCentre[0] >= maxXBound || veinCentre[0] <= minXBound || veinCentre[1] >= maxZBound || veinCentre[1] <= minZBound) {
          continue;
        }

        const veinRng = new SeededRandom(`${veinCentre[0]}${veinCentre[1]}${this.seed}ore`);
        const veinCentreY = Math.floor(veinRng.next() * (oreType.maxHeight + 1 - oreType.minHeight)) + oreType.minHeight;

        const minX = Math.max(chunkStartX, veinCentre[0] - oreType.veinRadius);
        const maxX = Math.min(chunkStartX + this.chunkSize - 1, veinCentre[0] + oreType.veinRadius);
        const minZ = Math.max(chunkStartZ, veinCentre[1] - oreType.veinRadius);
        const maxZ = Math.min(chunkStartZ + this.chunkSize - 1, veinCentre[1] + oreType.veinRadius);

        for (let blockX = minX; blockX <= maxX; blockX++) {
          for (let blockZ = minZ; blockZ <= maxZ; blockZ++) {
            if (!(manhattanDistance(veinCentre, blockX, blockZ) > oreType.veinRadius)) {
              if (!(existenceRng.next() >= oreType.placementChance)) {
                oreBlocksFlat.push(blockX, veinCentreY, blockZ, oreType.blockId);
              }
            }
          }
        }
      }
    }

    return new Int32Array(oreBlocksFlat);
  }

  addOresToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    oreDepthBelowSurface: number,
    heightmapVals: any,
    oreData: Int32Array
  ) {
    const chunkEndY = chunkStartY + this.chunkSize;
    const oreDataLength = oreData.length;

    for (let i = 0; i < oreDataLength; i += 4) {
      const blockY = oreData[i + 1]!;
      if (blockY < chunkStartY || blockY >= chunkEndY) {
        continue;
      }

      const blockX = oreData[i]!;
      const blockZ = oreData[i + 2]!;

      if (blockY < heightmapVals.get(blockX, blockZ, HeightField.GroundHeight) - oreDepthBelowSurface) {
        const blockId = oreData[i + 3]!;
        chunkArray.set(blockX - chunkStartX, blockY - chunkStartY, blockZ - chunkStartZ, blockId);
      }
    }
  }
}