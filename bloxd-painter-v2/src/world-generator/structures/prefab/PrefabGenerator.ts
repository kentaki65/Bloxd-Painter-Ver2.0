import { BlockPlacementMode, CaveMobs, ChunkSize, HeightField, OUT_OF_RUNGE_NUMBER, Rarity } from "../../core/constants.js";
import type { BlockId, CaveInterval, CaveMobNames, GeneratedPrefabPlacement, Prefab, PrefabCenter, PrefabConfig, PrefabInstance, PrefabPlacement, Seed, Vec2 } from "../../core/types.js";
import { Sparse3DMap } from "../../data/array/Sparse3DMap.js";
import { initializeEnchantmentGenerator } from "../../enchantment/EnchantmentGenerator.js";
import { PointsGenerator } from "../../generator/PointsGenerator.js";
import { SeededRandom } from "../../noise/SeededRandom.js";
import { BidirectionalMap } from "../../utils/BidirectionalMap.js";
import { BlockIdMappingManager } from "../../utils/BlockIdMapping.js";
import { mirrorDistribution, rotationDistribution } from "../../utils/randomValues.js";
import { TTLCache } from "@isaacs/ttlcache";
import ndarray from "ndarray";
import { prefabToWorldX, prefabToWorldZ, worldToPrefabX, worldToPrefabZ } from "./PrefabUtils.js";
import { CaveManager } from "../cave/CaveManager.js";
import { FixedPointPrefabManager } from "./FixedPointPrefabManager.js";
import { collectCaveIntervals } from "../cave/CaveUtils.js";
import { isNullOrUndefined } from "../../utils/utils.js";
import { divideByChunkSize } from "../../utils/mathHelper.js";
import voxelCrunch from 'voxel-crunch';
import { LootChestBlockGenerator } from "../lootChest/LootChestBlockGenerator.js";
import { ChunkDataCache3D } from "../../data/cache/ChunkDataCache3D.js";
import { ChunkGeneratorCache } from "../../data/cache/ChunkGeneratorCache.js";
import { CaveDataView } from "../cave/CaveDataViewer.js";

type PrefabCentrePointGenerators = Record<number, Record<number, PointsGenerator | null>>

export class PrefabGenerator {
  seed: Seed;
  chunkSize: number;
  invisibleSolidBlockId: BlockId;
  emptySpawnerBlockId: BlockId;
  chestToLootChestBlockId: BidirectionalMap;
  defaultSpawnerBlockId: BlockId;
  mobTypeToSpawnerBlockId: Record<CaveMobNames, BlockId>;
  prefabRadius: number;
  prefabCentrePointGeneratorPerDensityPerType: PrefabCentrePointGenerators;

  static DECODED_PREFAB_SCHEMATIC_CACHE = new TTLCache({
    max: 1000,
    ttl: 86400000,
    updateAgeOnGet: true
  });

  static BLOCK_ID_MAPPINGS: BlockIdMappingManager | undefined = undefined;
  static DEFAULT_MOB_TYPE: (typeof CaveMobs)[number] = "Draugr Zombie";
  static DEFAULT_CHEST_QUALITY = Rarity.COMMON;

  constructor(options: PrefabConfig) {
    const { seed, chunkSize, blockMetadata, itemMetadata, prefabSize, typeSettings } = options;

    PrefabGenerator.BLOCK_ID_MAPPINGS ||= new BlockIdMappingManager(blockMetadata);
    initializeEnchantmentGenerator(itemMetadata);

    this.seed = seed;
    this.chunkSize = chunkSize;
    this.invisibleSolidBlockId = blockMetadata["Invisible Solid"].id;
    this.emptySpawnerBlockId = blockMetadata["Empty Spawner Block"].id;
    this.chestToLootChestBlockId = new BidirectionalMap({
      [blockMetadata.Chest.id]: blockMetadata["Loot Chest"].id,
      [blockMetadata["Chest|meta|rot2"].id]: blockMetadata["Loot Chest|meta|rot2"].id,
      [blockMetadata["Chest|meta|rot3"].id]: blockMetadata["Loot Chest|meta|rot3"].id,
      [blockMetadata["Chest|meta|rot4"].id]: blockMetadata["Loot Chest|meta|rot4"].id
    });

    const mobTypeToSpawnerBlockId = {} as Record<CaveMobNames, BlockId>;

    for (const mobType of CaveMobs) {
      mobTypeToSpawnerBlockId[mobType] = blockMetadata[`${mobType} Spawner Block`].id;
    }

    this.mobTypeToSpawnerBlockId = mobTypeToSpawnerBlockId;
    this.defaultSpawnerBlockId = this.mobTypeToSpawnerBlockId[PrefabGenerator.DEFAULT_MOB_TYPE];
    this.prefabRadius = Math.ceil(prefabSize / 2);

    const pointGeneratorPerDensityPerType: PrefabCentrePointGenerators = {};

    for (const densityKey in typeSettings) {
      const density = Number(densityKey);
      pointGeneratorPerDensityPerType[density] = {};

      const { densitySettings } = typeSettings[density];
      for (const typeKey in densitySettings) {
        const type = Number(typeKey);
        const settings = densitySettings[type];
        let pointGenerator = null;

        if (settings !== null) {
          const searchRadius = Math.ceil(400 / settings.minDistanceBetweenPrefabs);
          pointGenerator = new PointsGenerator(
            `prefab|${density}|${type}`,
            settings.minDistanceBetweenPrefabs,
            false,
            true,
            seed,
            searchRadius,
            chunkSize,
            null,
            true
          );
        }

        pointGeneratorPerDensityPerType[density][type] = pointGenerator;
      }
    }
    this.prefabCentrePointGeneratorPerDensityPerType = pointGeneratorPerDensityPerType;
  }

  static isWithinPrefabClearing(
    x: number,
    z: number,
    placedPrefabs: PrefabCenter[]
  ) {
    for (const placedPrefab of placedPrefabs) {
      if ((x - placedPrefab.centreX) ** 2 + (z - placedPrefab.centreZ) ** 2 < placedPrefab.prefab.clearingRadiusSquared) {
        return true;
      }
    }
    return false;
  }

  getPrefabsForChunk(
    chunkStartX: number,
    chunkStartZ: number,
    heightmapVals: ChunkDataCache3D,
    biomeGrid: ChunkGeneratorCache,
    caveData: CaveDataView,
    fixedPrefabInfo: ChunkDataCache3D | null
  ) {
    const prefabsForChunk = [];
    const halfChunkSize = this.chunkSize >> 1;
    const minX = chunkStartX - this.prefabRadius;
    const maxX = chunkStartX + this.chunkSize + this.prefabRadius;
    const minZ = chunkStartZ - this.prefabRadius;
    const maxZ = chunkStartZ + this.chunkSize + this.prefabRadius;

    for (const densityKey in this.prefabCentrePointGeneratorPerDensityPerType) {
      const density = Number(densityKey);
      const pointGeneratorsForDensity = this.prefabCentrePointGeneratorPerDensityPerType[density];

      for (const typeKey in pointGeneratorsForDensity) {
        const type = Number(typeKey);
        const pointGenerator = pointGeneratorsForDensity[type];
        if (pointGenerator === null) {
          continue;
        }

        const candidatePoints = pointGenerator.getPointsAroundPoint(chunkStartX + halfChunkSize, chunkStartZ + halfChunkSize);

        for (const candidatePoint of candidatePoints) {
          const pointX = candidatePoint[0];
          const pointZ = candidatePoint[1];

          if (pointX < minX || pointX >= maxX || pointZ < minZ || pointZ >= maxZ) {
            continue;
          }

          const biome = biomeGrid.getOrGenerate(pointX, pointZ)[0]!.biome;
          const rng = new SeededRandom(`${pointX}|${pointZ}|${this.seed}|prefabGenerator`);
          const selectedPrefab = biome.getRandomPrefab(rng, density, type);
          if (selectedPrefab === null) {
            continue;
          }

          const rotationDegrees = selectedPrefab.transformationsEnabled ? rotationDistribution.sample(rng) : 0;
          const baseMirrorFlag = !!selectedPrefab.transformationsEnabled && mirrorDistribution.sample(rng);

          let xRotationOffset: number | null = null;
          let zRotationOffset: number | null = null;
          let shouldSwapXZ = baseMirrorFlag;

          switch (rotationDegrees) {
            case 0:
              break;
            case 90:
              xRotationOffset = selectedPrefab.dimensionX - 1;
              shouldSwapXZ = !shouldSwapXZ;
              break;
            case 180:
              xRotationOffset = selectedPrefab.dimensionX - 1;
              zRotationOffset = selectedPrefab.dimensionZ - 1;
              break;
            case 270:
              zRotationOffset = selectedPrefab.dimensionZ - 1;
              shouldSwapXZ = !shouldSwapXZ;
              break;
            default:
              console.error(`Invalid prefab rotation: ${rotationDegrees}`);
          }

          const placement: PrefabPlacement = {
            centreX: pointX,
            centreZ: pointZ,
            anchorX: pointX - (selectedPrefab.dimensionX >> 1),
            anchorZ: pointZ - (selectedPrefab.dimensionZ >> 1),
            prefab: selectedPrefab,
            xRotationOffset,
            zRotationOffset,
            shouldSwapXZ
          };

          const { anchorY, isOnSolidGround } = this.getPrefabGroundingInfo(placement, rng, heightmapVals, caveData, fixedPrefabInfo);

          if (!isOnSolidGround) {
            continue;
          }

          const chestLocationToQuality = new Sparse3DMap<any>();
          for (const chestLocation of selectedPrefab.chestLocations) {
            const x = prefabToWorldX(placement, chestLocation.localX, chestLocation.localZ);
            const z = prefabToWorldZ(placement, chestLocation.localX, chestLocation.localZ);
            const y = anchorY + chestLocation.localY;
            const quality = chestLocation.qualityDistribution.sample(rng);
            chestLocationToQuality.set(x, y, z, quality);
          }

          const spawnerBlockLocationToBlockId = new Sparse3DMap<number>();
          for (const spawnerLocation of selectedPrefab.spawnerBlockLocations) {
            const x = prefabToWorldX(placement, spawnerLocation.localX, spawnerLocation.localZ);
            const z = prefabToWorldZ(placement, spawnerLocation.localX, spawnerLocation.localZ);
            const y = anchorY + spawnerLocation.localY;
            const mobType = spawnerLocation.mobTypeDistribution.sample(rng);
            const spawnerBlockId = this.mobTypeToSpawnerBlockId[mobType];
            spawnerBlockLocationToBlockId.set(x, y, z, spawnerBlockId);
          }

          let blockIdMapping = null;
          if (rotationDegrees !== 0 || baseMirrorFlag) {
            blockIdMapping = PrefabGenerator.BLOCK_ID_MAPPINGS!.getBlockIdMapping(rotationDegrees, baseMirrorFlag);
          }

          const generatedPlacement: GeneratedPrefabPlacement = {
            ...placement,
            anchorY,
            chestLocationToQuality,
            spawnerBlockLocationToBlockId,
            blockIdMapping,
            decodedPrefabSchematic: this.getDecodedPrefabSchematic(selectedPrefab)
          };

          prefabsForChunk.push(generatedPlacement);
        }
      }
    }

    return prefabsForChunk;
  }

  getPrefabGroundingInfo(
    placement: PrefabPlacement,
    rng: SeededRandom,
    heightmapVals: ChunkDataCache3D,
    caveData: CaveDataView,
    fixedPrefabInfo: ChunkDataCache3D | null
  ) {
    const prefab = placement.prefab;
    const centreX = placement.centreX;
    const centreZ = placement.centreZ;
    const groundingPoints: Vec2[] = [];

    if (prefab.groundingPoints === "centre") {
      groundingPoints.push([centreX, centreZ]);
    } else {
      for (const localGroundingPoint of prefab.groundingPoints) {
        const x = prefabToWorldX(placement, localGroundingPoint.localX, localGroundingPoint.localZ);
        const z = prefabToWorldZ(placement, localGroundingPoint.localX, localGroundingPoint.localZ);
        groundingPoints.push([x, z]);
      }
    }

    let groundingInfo;
    const undergroundYInterval = prefab.undergroundYInterval;
    if (undergroundYInterval !== null) {
      const { minY, maxY } = undergroundYInterval;
      groundingInfo = this.getCaveGroundingInfoFromGroundingPoints(
        groundingPoints,
        prefab.groundingRadius,
        rng,
        minY,
        maxY,
        caveData
      );
    } else {
      groundingInfo = this.getSurfaceGroundingInfoFromGroundingPoints(
        groundingPoints,
        prefab.groundingRadius,
        heightmapVals,
        caveData,
        fixedPrefabInfo
      );
    }

    groundingInfo.anchorY += prefab.yOffset;
    return groundingInfo;
  }

  getSurfaceGroundingInfoFromGroundingPoints(
    groundingPoints: Vec2[],
    groundingRadius: number,
    heightmapVals: ChunkDataCache3D,
    caveData: CaveDataView,
    fixedPrefabInfo: ChunkDataCache3D | null
  ) {
    let minGroundHeight = 10000;

    for (const groundingPoint of groundingPoints) {
      const pointX = groundingPoint[0];
      const pointZ = groundingPoint[1];

      for (let x = pointX - groundingRadius; x < pointX + groundingRadius; x++) {
        for (let z = pointZ - groundingRadius; z < pointZ + groundingRadius; z++) {
          if (heightmapVals.getOrGenerate(x, z, HeightField.WaterHeight) !== OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
            return { anchorY: -10000, isOnSolidGround: false };
          }

          const groundHeight = heightmapVals.getOrGenerate(x, z, HeightField.GroundHeight);

          if (CaveManager.isInCave(x, groundHeight, z, caveData)) {
            return { anchorY: -10000, isOnSolidGround: false };
          }

          if (FixedPointPrefabManager.isNearFixedPointPrefab(x, z, fixedPrefabInfo)) {
            return { anchorY: -10000, isOnSolidGround: false };
          }

          minGroundHeight = Math.min(minGroundHeight, groundHeight);
        }
      }
    }

    return { anchorY: minGroundHeight, isOnSolidGround: true };
  }

  getCaveGroundingInfoFromGroundingPoints(
    groundingPoints: Vec2[],
    groundingRadius: number,
    rng: SeededRandom,
    minY: number,
    maxY: number,
    caveData: CaveDataView
  ) {
    const candidateFloors: CaveInterval[] = [];

    for (const groundingPoint of groundingPoints) {
      const pointX = groundingPoint[0];
      const pointZ = groundingPoint[1];

      for (let x = pointX - groundingRadius; x < pointX + groundingRadius; x++) {
        for (let z = pointZ - groundingRadius; z < pointZ + groundingRadius; z++) {
          collectCaveIntervals(x, z, caveData, false, candidateFloors);
        }
      }
    }

    function randomInt(min: number, max: number) {
      return Math.floor(rng.next() * (max - min + 1)) + min;
    }

    if (candidateFloors.length === 0) {
      return { anchorY: randomInt(minY, maxY), isOnSolidGround: true };
    }

    (function (floors, minY, maxY) {
      for (let i = 0; i < floors.length; i++) {
        const floor = floors[i]!;
        if (floor.floorY < minY || floor.floorY > maxY) {
          floors.splice(i, 1);
          i--;
        }
      }
    })(candidateFloors, minY, maxY);

    if (candidateFloors.length === 0) {
      return { anchorY: -10000, isOnSolidGround: false };
    }

    return {
      anchorY: candidateFloors[randomInt(0, candidateFloors.length - 1)]!.floorY,
      isOnSolidGround: true
    };
  }

  getBlockFromPrefabAtPoint(
    worldX: number,
    worldY: number,
    worldZ: number,
    prefab: PrefabInstance,
    specialBlockGenerators: Sparse3DMap<LootChestBlockGenerator>
  ) {
    let blockId = this.getPrefabBlock(worldX, worldY, worldZ, prefab);
    if (blockId === 0) {
      return blockId;
    }

    if (blockId === this.emptySpawnerBlockId) {
      blockId = prefab.spawnerBlockLocationToBlockId.get(worldX, worldY, worldZ) ?? this.defaultSpawnerBlockId;
    }

    if (blockId < 0) {
      return blockId;
    }

    blockId = prefab.blockIdMapping?.[blockId] ?? blockId;

    if (this.chestToLootChestBlockId.reverseGet(blockId) !== undefined) {
      const quality = prefab.chestLocationToQuality.get(worldX, worldY, worldZ) ?? PrefabGenerator.DEFAULT_CHEST_QUALITY;
      const specialBlockGenerator = new LootChestBlockGenerator(blockId, this.seed, worldX, worldY, worldZ, quality);
      specialBlockGenerators.set(worldX, worldY, worldZ, specialBlockGenerator);
    }

    return blockId;
  }

  getPrefabBlock(
    worldX: number,
    worldY: number,
    worldZ: number,
    prefab: PrefabInstance
  ) {
    const schematicInfo = prefab.prefab;
    const localY = worldY - prefab.anchorY;

    if (localY < 0 || localY >= schematicInfo.dimensionY) {
      return 0;
    }

    const localX = function (placement: PrefabPlacement, worldX: number, worldZ: number) {
      if (placement.shouldSwapXZ) {
        return worldToPrefabZ(placement, worldZ);
      }
      return worldToPrefabX(placement, worldX);
    }(prefab, worldX, worldZ);

    const localZ = function (placement: PrefabPlacement, worldX: number, worldZ: number) {
      if (placement.shouldSwapXZ) {
        return worldToPrefabX(placement, worldX);
      }
      return worldToPrefabZ(placement, worldZ);
    }(prefab, worldX, worldZ);

    if (localX < 0 || localX >= schematicInfo.dimensionX || localZ < 0 || localZ >= schematicInfo.dimensionZ) {
      return 0;
    } else {
      return prefab.decodedPrefabSchematic.get(localX, localY, localZ);
    }
  }

  getDecodedPrefabSchematic(
    prefab: Prefab
  ) {
    const schematicName = prefab.schematic.name;
    const cached = PrefabGenerator.DECODED_PREFAB_SCHEMATIC_CACHE.get(schematicName);
    if (!isNullOrUndefined(cached)) {
      return cached;
    }

    const { dimensionX, dimensionY, dimensionZ } = prefab;
    const decoded = ndarray(new Int32Array(dimensionX * dimensionY * dimensionZ), [dimensionX, dimensionY, dimensionZ]);

    const chestLocationSet = new Sparse3DMap<boolean>();
    for (const chestLocation of prefab.chestLocations) {
      chestLocationSet.set(chestLocation.localX, chestLocation.localY, chestLocation.localZ, true);
    }

    const spawnerLocationSet = new Sparse3DMap<boolean>();
    for (const spawnerLocation of prefab.spawnerBlockLocations) {
      spawnerLocationSet.set(spawnerLocation.localX, spawnerLocation.localY, spawnerLocation.localZ, true);
    }

    for (let blockX = 0; blockX < dimensionX; blockX += ChunkSize) {
      for (let blockY = 0; blockY < dimensionY; blockY += ChunkSize) {
        for (let blockZ = 0; blockZ < dimensionZ; blockZ += ChunkSize) {
          const rleChunkArray = ndarray(new Uint16Array(32768), [ChunkSize, ChunkSize, ChunkSize]);
          const rleBytes = prefab.schematic.getRLEChunk(divideByChunkSize(blockX), divideByChunkSize(blockY), divideByChunkSize(blockZ));
          voxelCrunch.decode(rleBytes, rleChunkArray.data);

          const xLimit = Math.min(ChunkSize, dimensionX - blockX);
          const yLimit = Math.min(ChunkSize, dimensionY - blockY);
          const zLimit = Math.min(ChunkSize, dimensionZ - blockZ);

          for (let localX = 0; localX < xLimit; localX++) {
            for (let localY = 0; localY < yLimit; localY++) {
              for (let localZ = 0; localZ < zLimit; localZ++) {
                let blockId = rleChunkArray.get(localX, localY, localZ);
                const worldBlockX = blockX + localX;
                const worldBlockY = blockY + localY;
                const worldBlockZ = blockZ + localZ;

                if (this.invisibleSolidBlockId === blockId) {
                  blockId = BlockPlacementMode.GUARANTEED_AIR;
                } else if (this.emptySpawnerBlockId === blockId) {
                  if (!spawnerLocationSet.get(worldBlockX, worldBlockY, worldBlockZ)) {
                    console.error(`Empty spawner block found in prefab ${prefab.schematic.name} at (${worldBlockX}, ${worldBlockY}, ${worldBlockZ}) with no mob type specified. Defaulting to "${PrefabGenerator.DEFAULT_MOB_TYPE}" mob type.`);
                  }
                } else {
                  const lootChestBlockId = this.chestToLootChestBlockId.get(blockId);
                  if (lootChestBlockId !== undefined) {
                    if (!chestLocationSet.get(worldBlockX, worldBlockY, worldBlockZ)) {
                      console.error(`Chest found in prefab ${prefab.schematic.name} at (${worldBlockX}, ${worldBlockY}, ${worldBlockZ}) with no quality specified. Defaulting to "${PrefabGenerator.DEFAULT_CHEST_QUALITY}" quality.`);
                    }
                    blockId = lootChestBlockId;
                  }
                }

                decoded.set(worldBlockX, worldBlockY, worldBlockZ, blockId);
              }
            }
          }
        }
      }
    }

    PrefabGenerator.DECODED_PREFAB_SCHEMATIC_CACHE.set(schematicName, decoded);
    return decoded;
  }
}