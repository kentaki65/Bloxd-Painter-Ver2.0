import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";
import { NoWaterHeightmap } from "./NoWaterHeightmap.js";
import { WaterBodyGenerator } from "../structures/water/WaterBodyGenerator.js";
import { HeightField, OUT_OF_RUNGE_NUMBER } from "../core/constants.js";
import { FixedPointPrefabManager } from "../structures/prefab/FixedPointPrefabManager.js";
import { ChunkDataCache3D } from "../data/cache/ChunkDataCache3D.js";
import { ChunkGeneratorCache } from "../data/cache/ChunkGeneratorCache.js";
import { Sparse3DArray } from "../data/array/Sparse3DArray.js";
import { Biome } from "../biome/Biome.js";
import type { HeightOverrideLayer } from "../../world/overrideLayers/HeightOverrideLayer.js";

export class HeightmapGenerator {
  closestBiomesForChunk: ChunkGeneratorCache;
  nearestFixedPrefabInfoForChunk: ChunkDataCache3D;
  noWaterHeightmapGenerator: NoWaterHeightmap;
  heightmapPerturb: SimpleOctavesNoise;
  waterBodyGenerator: WaterBodyGenerator;
  heightOverrideLayer: HeightOverrideLayer | null;

  constructor(
    closestBiomesForChunk: ChunkGeneratorCache,
    nearestFixedPrefabInfoForChunk: ChunkDataCache3D,
    noWaterHeightmapGenerator: NoWaterHeightmap,
    heightmapPerturb: SimpleOctavesNoise,
    waterBodyGenerator: WaterBodyGenerator,
    heightOverrideLayer: HeightOverrideLayer | null = null
  ) {
    this.closestBiomesForChunk = closestBiomesForChunk;
    this.nearestFixedPrefabInfoForChunk = nearestFixedPrefabInfoForChunk;
    this.noWaterHeightmapGenerator = noWaterHeightmapGenerator;
    this.heightmapPerturb = heightmapPerturb;
    this.waterBodyGenerator = waterBodyGenerator;
    this.heightOverrideLayer = heightOverrideLayer;
  }

  generateAndSet(
    chunkStartX: number,
    chunkStartZ: number,
    heightmapVals: Sparse3DArray
  ) {
    const heightOverride = this.heightOverrideLayer?.get(chunkStartX, chunkStartZ);

    if (heightOverride !== undefined) {
      heightmapVals.set(chunkStartX, chunkStartZ, HeightField.GroundHeight, heightOverride);
      heightmapVals.set(chunkStartX, chunkStartZ, HeightField.WaterHeight, OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE);
      heightmapVals.set(chunkStartX, chunkStartZ, HeightField.CavesAllowedBelowY, heightOverride - 15);
      return;
    }
    
    const biomeInfos = this.closestBiomesForChunk.getOrGenerate(
      chunkStartX,
      chunkStartZ
    );

    const xPerturb = Math.floor(
      this.heightmapPerturb.getOctaves(chunkStartX, chunkStartZ)
    );

    const zPerturb = Math.floor(
      this.heightmapPerturb.getOctaves(chunkStartX + 200, chunkStartZ + 778)
    );

    const {
      groundHeight,
      waterHeight,
      cavesAllowedBelowY
    } = this.getWithWaterHeightmapVal(
      chunkStartX + xPerturb,
      chunkStartZ + zPerturb,
      biomeInfos
    );

    this.setHeightmapValuesWithFixedPrefabSmoothing(
      chunkStartX,
      chunkStartZ,
      xPerturb,
      zPerturb,
      heightmapVals,
      groundHeight,
      waterHeight,
      cavesAllowedBelowY
    );
  }

  getWithWaterHeightmapVal(
    x: number,
    z: number,
    biomeInfos: {
      biome: Biome;
      weight: number;
    }[]
  ) {
    const noWaterHeight = this.noWaterHeightmapGenerator.getNoWaterHeightmapVal(
      x,
      z,
      biomeInfos
    );

    const {
      distFromWater,
      waterRadius,
      waterHeight,
      waterbedHeight,
      isLake,
      needOutsideWaterDist
    } = this.waterBodyGenerator.getInfoNeededForWaterGen(x, z);

    let groundHeight = 0;
    let waterHeightValue = OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE;
    let cavesAllowedBelowY = 10000;

    const waterInfluenceRadius = waterRadius + needOutsideWaterDist;

    if (distFromWater <= waterInfluenceRadius) {
      const nearWaterRadius = waterRadius + 4;
      const nearWaterHeight = waterHeight + 2;

      if (distFromWater <= waterRadius) {
        let waterProgress = distFromWater / waterRadius;

        if (isLake) {
          waterProgress *= waterProgress * waterProgress;
          groundHeight = Math.floor(
            waterbedHeight +
            (waterHeight - waterbedHeight) * waterProgress -
            2
          );
        } else {
          waterProgress *= waterProgress;
          groundHeight = Math.floor(
            waterbedHeight +
            (waterHeight - waterbedHeight) * waterProgress
          );
        }

        waterHeightValue = waterHeight;
      } else if (distFromWater <= nearWaterRadius) {
        const progress =
          (distFromWater - waterRadius) /
          (nearWaterRadius - waterRadius);

        groundHeight =
          waterHeight +
          Math.ceil((nearWaterHeight - waterHeight) * progress);
      } else {
        const progress =
          (distFromWater - nearWaterRadius) /
          (waterInfluenceRadius - nearWaterRadius);

        groundHeight =
          nearWaterHeight +
          Math.ceil((noWaterHeight - nearWaterHeight) * progress);
      }

      cavesAllowedBelowY = groundHeight - 15;
    } else {
      groundHeight = noWaterHeight;
    }

    return {
      groundHeight,
      waterHeight: waterHeightValue,
      cavesAllowedBelowY
    };
  }

  setHeightmapValuesWithFixedPrefabSmoothing(
    x: number,
    z: number,
    xPerturb: number,
    zPerturb: number,
    heightmapVals: Sparse3DArray,
    groundHeight: number,
    waterHeight: number,
    cavesAllowedBelowY: number
  ) {
    const smoothedHeight = FixedPointPrefabManager.smoothHeightmapForFixedPointPrefab(
      Math.round(x + xPerturb / 4),
      Math.round(z + zPerturb / 4),
      groundHeight,
      this.nearestFixedPrefabInfoForChunk
    );

    if (smoothedHeight !== null && waterHeight > (groundHeight = smoothedHeight)) {
      waterHeight = OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE;
    }

    heightmapVals.set(x, z, HeightField.GroundHeight, groundHeight);
    heightmapVals.set(x, z, HeightField.WaterHeight, waterHeight);
    heightmapVals.set(
      x,
      z,
      HeightField.CavesAllowedBelowY,
      cavesAllowedBelowY
    );

    if (this.shouldCurtailCave(x, z, smoothedHeight !== null)) {
      heightmapVals.set(
        x,
        z,
        HeightField.CavesAllowedBelowY,
        groundHeight - 15
      );
    }
  }

  shouldCurtailCave(x: number, z: number, hasFixedPrefab: boolean) {
    if (hasFixedPrefab) {
      return true;
    }

    const distanceFromOrigin = Math.max(Math.abs(x), Math.abs(z));

    if (distanceFromOrigin < 50) {
      return true;
    }

    const xDistanceFromGridLine = Math.min(
      Math.abs((x - 300) % 1000),
      1000 - Math.abs((x - 300) % 1000)
    );

    const zDistanceFromGridLine = Math.min(
      Math.abs((z - 300) % 1000),
      1000 - Math.abs((z - 300) % 1000)
    );

    return (
      distanceFromOrigin > 10000 &&
      Math.max(xDistanceFromGridLine, zDistanceFromGridLine) < 50
    );
  }
}