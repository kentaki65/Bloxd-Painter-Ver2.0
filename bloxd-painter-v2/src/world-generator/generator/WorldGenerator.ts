import voxelCrunch from 'voxel-crunch';
import { BiomeSelector } from "../biome/BiomeSelector.js";
import type { BlockMetadata, BlockName, ClusterConfig, GeneratedPrefabPlacement, Seed, TreePlacement, Vec2 } from "../core/types.js";
import { PartitionedTTLCache } from "../data/cache/PartitionedTTLCache.js";
import { CaveDecorationGenerator } from "../structures/cave/CaveDecorationGenerator.js";
import { FixedPointPrefabManager } from "../structures/prefab/FixedPointPrefabManager.js";
import { PrefabGenerator } from "../structures/prefab/PrefabGenerator.js";
import { TreeGenerator } from "../structures/tree/TreeGenerator.js";
import { NoWaterHeightmap } from "./NoWaterHeightmap.js";
import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";
import { WaterBodyGenerator } from "../structures/water/WaterBodyGenerator.js";
import { ChunkGenerator } from "./ChunkGenerator.js";
import { PartitionTTLCache } from "../data/cache/PartitionTTLCache.js";
import { oreConfigs, OreGenerator } from "../structures/ore/oreGenerator.js";
import type { OreConfig } from "../structures/ore/oreGenerator.js";
import { createStoneFrequencyData } from "../utils/createStoneFrequencyData.js";
import { getBlockId } from "../utils/utils.js";
import { Desert } from "../biome/Desert/Desert.js";
import { CactusDesert } from "../biome/Desert/CactusDesert.js";
import { RedDesert } from "../biome/Desert/RedDesert.js";
import { Plains } from "../biome/Plains/Plains.js";
import { Forest } from "../biome/Forest/Forest.js";
import { PumpkinForest } from "../biome/Forest/PumpkinForest.js";
import { PearForest } from "../biome/Forest/PearForest.js";
import { PineForest } from "../biome/Forest/PineForest.js";
import { SnowyPineForest } from "../biome/Forest/SnowyPineForest.js";
import { Jungle } from "../biome/Forest/Jungle.js";
import { AutumnForest } from "../biome/Forest/AutumnForest.js";
import { RollingHills } from "../biome/Mountains/RollingHills.js";
import { SnowyMountains } from "../biome/Mountains/SnowyMountains.js";
import { BlueForest } from "../biome/Forest/BlueForest.js";
import { CherryForest } from "../biome/Forest/CherryForest.js";
import { SnowyPlains } from "../biome/Plains/SnowyPlains.js";
import { TallGrassPlains } from "../biome/Plains/TallGrassPlains.js";
import { MaplePlains } from "../biome/Plains/MaplePlains.js";
import { FrozenBadlandsPlains } from "../biome/Plains/FrozenBadlandsPlains.js";
import { FrozenBadlandsForest } from "../biome/Forest/FrozenBadlandsForest.js";
import { CaveLayer, FeatureHeight, HeightField } from "../core/constants.js";
import { ChunkGeneratorCache } from '../data/cache/ChunkGeneratorCache.js';
import { HeightmapGenerator } from './HeightmapGenerator.js';
import { ChunkDataCache3D } from '../data/cache/ChunkDataCache3D.js';
import { CaveManager } from '../structures/cave/CaveManager.js';
import { CustomBiome } from '../biome/CustomBiome.js';
import type { CustomBiomeDefinition } from '../biome/CustomBiome.js';
import { ChunkArray2D } from '../data/array/ChunkArray2D.js';
import { CombinedArray3D } from '../data/array/CombinedArray3D.js';
import { InnerChunkCaveDataView } from '../structures/cave/CaveDataViewer.js';
import type { BiomeOverrideLayer } from '../../world/overrideLayers/BiomeOverrideLayer.js';
import type { HeightOverrideLayer } from '../../world/overrideLayers/HeightOverrideLayer.js';

interface ChunkColumInfo {
  biomeInfos: {
    biomeIds: ChunkArray2D;
    stoneTypeIds: ChunkArray2D;
  };
  heightmapVals: CombinedArray3D;
  caveHeightmapVals: InnerChunkCaveDataView;
  treesForChunk: TreePlacement[];
  chunkPrefabs: GeneratedPrefabPlacement[];
  chunkOres: Int32Array<ArrayBuffer>;
  nearestFixedPrefabInfoForChunk: ChunkDataCache3D | null;
  decodedFixedPointPrefabsForChunk: never[] | {
    decodedPrefabSchematic: {};
    bottomLeftX: number;
    bottomLeftZ: number;
    floorY: number;
    ceilingY: number;
    topRightX: number;
    topRightZ: number;
  }[]
  caveDecorations: any;
}

interface GeneratorOptions {
  enableWaterGeneration: boolean;
  biomeEntries: CustomBiomeDefinition[] | null;
  oreConfigOverrides: OreConfig[];
  cave: {
    fillBlockName?: BlockName;
    decorationConfigs?: ClusterConfig[] | null;
  };
}

let xR: PartitionedTTLCache | undefined;

export class WorldGenerator {
  chunkSize: number;
  maxTreeRadius: number;
  prefabSize: number;
  maxPrefabGroundingRadius: number;
  treeGenerator: TreeGenerator;
  prefabGenerator: PrefabGenerator;
  caveGenerator: CaveManager;
  caveDecorationGenerator: CaveDecorationGenerator;
  biomeSelector: BiomeSelector;
  fixedPointPrefabTracker: FixedPointPrefabManager;
  noWaterHeightmapGenerator: NoWaterHeightmap;
  heightmapPerturb: SimpleOctavesNoise;
  waterBodyGenerator: WaterBodyGenerator;
  needOutsideWaterDist: number;
  mostRecentlyAccessedChunkColumnPos: Vec2;
  mostRecentlyAccessedChunkColumn: any;
  chunkColumnInfos: PartitionTTLCache<ChunkColumInfo>;
  chunkGenerator: ChunkGenerator;
  overrideLayer: BiomeOverrideLayer | null;
  heightOverrideLayer: HeightOverrideLayer | null

  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    itemMetadata: any,
    seed: Seed,
    useBiggerCache: boolean,
    fixedPointPrefabs: any,
    cacheSizeMultiplier: number,
    options: GeneratorOptions | null = null,
    overrideLayer: BiomeOverrideLayer | null = null,
    heightOverrideLayer: HeightOverrideLayer | null = null,
  ) {
    this.chunkSize = chunkSize;
    this.maxTreeRadius = 3;
    this.prefabSize = 40;
    this.maxPrefabGroundingRadius = 4;
    this.needOutsideWaterDist = 15;
    this.mostRecentlyAccessedChunkColumnPos = [0, 0];
    this.mostRecentlyAccessedChunkColumn = null;
    this.overrideLayer = overrideLayer;
    this.heightOverrideLayer = heightOverrideLayer;

    if (!xR) {
      const HH = Math.floor((useBiggerCache ? 1750 : 125) * cacheSizeMultiplier);
      xR = new PartitionedTTLCache({
        max: HH,
        ttl: 40000,
        updateAgeOnGet: true,
        keySeparator: PartitionedTTLCache.DEFAULT_KEY_SEPARATOR
      });
    }

    this.chunkColumnInfos = xR.partitionTTLCache();
    this.caveGenerator = new CaveManager(
      seed,
      chunkSize,
      blockMetadata,
      options?.cave?.fillBlockName as BlockName ?? "Lava"
    );

    const oreGenerator = new OreGenerator(
      blockMetadata,
      seed,
      chunkSize,
      options?.oreConfigOverrides ?? oreConfigs
    );

    const biomeOptions = {
      chunkSize,
      blockMetadata,
      worldGenerator: this,
      seed,
      biomeOpts: {
        oreGenerator
      }
    };

    const customBiomes = options?.biomeEntries ?? null;
    const biomeEntries = customBiomes !== null ? function (customBiomeDefs, IH) {
      let { chunkSize, blockMetadata, worldGenerator, seed, biomeOpts } = IH;

      if (customBiomeDefs.length === 0) {
        throw new Error("buildCustomBiomes requires at least one custom biome");
      }

      return customBiomeDefs.map(customBiomeDef => {
        const customBiome = new CustomBiome(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts, customBiomeDef);
        const stoneTypes = customBiomeDef.XI.map(entry => ({
          stoneId: getBlockId(entry.blockName, blockMetadata),
          frequency: entry.frequency
        }));

        const stoneFrequencyData = createStoneFrequencyData(stoneTypes);

        return {
          biome: customBiome,
          frequency: customBiomeDef.frequency,
          altBiome: null,
          stoneTypes: stoneFrequencyData.stoneFrequencies,
          stoneFrequencies: stoneFrequencyData.frequencyValues,
          stonesTotalFrequency: stoneFrequencyData.stonesTotalFrequency
        };
      });
    }(customBiomes, biomeOptions) : function (biomeOptions) {
      let { chunkSize, blockMetadata, worldGenerator, seed, biomeOpts } = biomeOptions;

      const desertBiome = new Desert(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const cactusDesertBiome = new CactusDesert(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const redDesertBiome = new RedDesert(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const plainsBiome = new Plains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const forestBiome = new Forest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const forestVariantBiome = new PumpkinForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const pearForestBiome = new PearForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const pineForestBiome = new PineForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const snowyPineForestBiome = new SnowyPineForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const jungleBiome = new Jungle(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const autumnForestBiome = new AutumnForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const rollingHillsBiome = new RollingHills(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const snowyMountainsBiome = new SnowyMountains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const blueForestBiome = new BlueForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const cherryForestBiome = new CherryForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const snowyPlainsBiome = new SnowyPlains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const tallGrassPlainsBiome = new TallGrassPlains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const maplePlainsBiome = new MaplePlains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const frozenBadlandsPlainsBiome = new FrozenBadlandsPlains(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);
      const frozenBadlandsForestBiome = new FrozenBadlandsForest(chunkSize, blockMetadata, worldGenerator, seed, biomeOpts);

      const stoneTypes = createStoneFrequencyData(function (blockMetadata) {
        return [{
          stoneId: blockMetadata.Stone.id,
          frequency: 100
        }, {
          stoneId: blockMetadata.Andesite.id,
          frequency: 4
        }, {
          stoneId: blockMetadata.Diorite.id,
          frequency: 2
        }, {
          stoneId: blockMetadata.Granite.id,
          frequency: 1
        }];
      }(blockMetadata));

      return [{
        biome: jungleBiome,
        frequency: 2,
        altBiome: forestBiome
      }, {
        biome: desertBiome,
        frequency: 31,
        altBiome: null
      }, {
        biome: frozenBadlandsPlainsBiome,
        frequency: 2,
        altBiome: plainsBiome
      }, {
        biome: cactusDesertBiome,
        frequency: 1,
        altBiome: null
      }, {
        biome: redDesertBiome,
        frequency: 4,
        altBiome: null
      }, {
        biome: jungleBiome,
        frequency: 6,
        altBiome: forestBiome
      }, {
        biome: plainsBiome,
        frequency: 62,
        altBiome: null
      }, {
        biome: frozenBadlandsPlainsBiome,
        frequency: 2,
        altBiome: plainsBiome
      }, {
        biome: maplePlainsBiome,
        frequency: 4,
        altBiome: null
      }, {
        biome: tallGrassPlainsBiome,
        frequency: 2,
        altBiome: null
      }, {
        biome: snowyPlainsBiome,
        frequency: 4,
        altBiome: null
      }, {
        biome: forestBiome,
        frequency: 16,
        altBiome: null
      }, {
        biome: cherryForestBiome,
        frequency: 4,
        altBiome: null
      }, {
        biome: pearForestBiome,
        frequency: 6,
        altBiome: null
      }, {
        biome: autumnForestBiome,
        frequency: 6,
        altBiome: null
      }, {
        biome: forestVariantBiome,
        frequency: 24,
        altBiome: null
      }, {
        biome: frozenBadlandsForestBiome,
        frequency: 2,
        altBiome: forestBiome
      }, {
        biome: cherryForestBiome,
        frequency: 2,
        altBiome: null
      }, {
        biome: jungleBiome,
        frequency: 4,
        altBiome: forestBiome
      }, {
        biome: pineForestBiome,
        frequency: 12,
        altBiome: forestBiome
      }, {
        biome: frozenBadlandsForestBiome,
        frequency: 2,
        altBiome: forestBiome
      }, {
        biome: snowyPineForestBiome,
        frequency: 2,
        altBiome: forestBiome
      }, {
        biome: rollingHillsBiome,
        frequency: 32,
        altBiome: null
      }, {
        biome: snowyMountainsBiome,
        frequency: 16,
        altBiome: null
      }, {
        biome: blueForestBiome,
        frequency: 4,
        altBiome: null
      }].map(HH => ({
        ...HH,
        stoneTypes: stoneTypes.stoneFrequencies,
        stoneFrequencies: stoneTypes.frequencyValues,
        stonesTotalFrequency: stoneTypes.stonesTotalFrequency
      }));
    }(biomeOptions);

    this.biomeSelector = new BiomeSelector(this, oreGenerator, seed, chunkSize, blockMetadata, biomeEntries, overrideLayer);
    this.treeGenerator = new TreeGenerator(this, this.biomeSelector, chunkSize, seed, blockMetadata);
    this.fixedPointPrefabTracker = new FixedPointPrefabManager(fixedPointPrefabs, chunkSize);
    this.prefabGenerator = new PrefabGenerator({
      seed,
      chunkSize,
      blockMetadata,
      itemMetadata,
      typeSettings: {
        [CaveLayer.SURFACE]: {
          densitySettings: {
            [FeatureHeight.MEDIUM]: {
              minDistanceBetweenPrefabs: 100
            },
            [FeatureHeight.HIGH]: {
              minDistanceBetweenPrefabs: 50
            }
          }
        },
        [CaveLayer.UNDERGROUND]: {
          densitySettings: {
            [FeatureHeight.MEDIUM]: {
              minDistanceBetweenPrefabs: 80
            },
            [FeatureHeight.HIGH]: null
          }
        }
      },
      prefabSize: this.prefabSize
    });

    const globalHeightmapOffset = new SimpleOctavesNoise([{
      amplitude: 11,
      frequency: 1 / 4000
    }, {
      amplitude: 4,
      frequency: 0.001
    }], `${seed}GlobalHeightmapOffset`);

    this.noWaterHeightmapGenerator = new NoWaterHeightmap(globalHeightmapOffset);
    this.heightmapPerturb = new SimpleOctavesNoise([{
      amplitude: 1,
      frequency: 1 / 14
    }, {
      amplitude: 5,
      frequency: 1 / 65
    }, {
      amplitude: 20,
      frequency: 0.004
    }], `${seed}HeightmapPerturb`);

    let heightmapPerturbAmplitude = 0;
    for (const {
      amplitude
    } of this.heightmapPerturb.customOctaves) {
      heightmapPerturbAmplitude += amplitude;
    }

    this.waterBodyGenerator = new WaterBodyGenerator(
      this.biomeSelector,
      this.noWaterHeightmapGenerator,
      seed,
      heightmapPerturbAmplitude,
      this.needOutsideWaterDist,
      useBiggerCache,
      options?.enableWaterGeneration ?? true
    );

    this.caveDecorationGenerator = new CaveDecorationGenerator(
      blockMetadata,
      chunkSize,
      seed,
      options?.cave?.decorationConfigs ?? null
    );

    this.chunkGenerator = new ChunkGenerator(
      chunkSize,
      this.biomeSelector,
      this.treeGenerator,
      this.prefabGenerator,
      blockMetadata,
      oreGenerator,
      this.biomeSelector.baseBiome,
      seed
    );
  }

  //chunkArray, chunkStartX, chunkStartY, chunkStartZ
  getChunk(
    chunkArray: any,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number
  ) {
    try {
      const { specialBlocks } = this.getChunkInternal(chunkArray, chunkStartX, chunkStartY, chunkStartZ);

      const encodedChunkData = voxelCrunch.encode(chunkArray.data);
      const encodedString = String.fromCharCode.apply(null, encodedChunkData);
      const hashInput = {
        a: encodedString,
        b: JSON.stringify(specialBlocks)
      };
      const hashInputJson = JSON.stringify(hashInput);

      return {
        hash: "hash",
        specialBlocks
      };
    } catch (error: any) {
      console.log(error.stack);
      console.error(error.stack);
      return;
    }
  }

  getChunkInternal(
    chunkArray: any,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number
  ) {
    const {
      biomeInfos,
      heightmapVals,
      caveHeightmapVals,
      treesForChunk,
      chunkPrefabs,
      chunkOres,
      nearestFixedPrefabInfoForChunk,
      decodedFixedPointPrefabsForChunk,
      caveDecorations
    } = this.getInfoForChunkColumn(chunkStartX, chunkStartZ);

    return this.chunkGenerator.fillChunk(
      chunkArray,
      chunkStartX,
      chunkStartY,
      chunkStartZ,
      heightmapVals,
      treesForChunk,
      chunkPrefabs,
      caveHeightmapVals,
      chunkOres,
      biomeInfos,
      nearestFixedPrefabInfoForChunk,
      decodedFixedPointPrefabsForChunk,
      caveDecorations
    );
  }

  getInfoForChunkColumn(
    chunkStartX: number,
    chunkStartZ: number
  ): ChunkColumInfo {
    if (
      this.mostRecentlyAccessedChunkColumn &&
      this.mostRecentlyAccessedChunkColumnPos[0] === chunkStartX &&
      this.mostRecentlyAccessedChunkColumnPos[1] === chunkStartZ
    ) {
      return this.mostRecentlyAccessedChunkColumn;
    }

    const chunkColumnKey = `${chunkStartX}|${chunkStartZ}`;
    const cachedChunkColumn = this.chunkColumnInfos.get(chunkColumnKey);

    if (cachedChunkColumn) {
      this.mostRecentlyAccessedChunkColumnPos[0] = chunkStartX;
      this.mostRecentlyAccessedChunkColumnPos[1] = chunkStartZ;
      this.mostRecentlyAccessedChunkColumn = cachedChunkColumn;
      return cachedChunkColumn;
    }

    const closestBiomes = this.getClosestBiomesForChunk(chunkStartX, chunkStartZ);

    const {
      nearestFixedPrefabInfoForChunk,
      decodedFixedPointPrefabsForChunk
    } = this.fixedPointPrefabTracker.getFixedPointPrefabInfoForChunk(chunkStartX, chunkStartZ);

    const heightmapVals = this.getHeightMapVals(chunkStartX, chunkStartZ, closestBiomes, nearestFixedPrefabInfoForChunk);
    const caveHeightmapVals = this.caveGenerator.getCaveHeightmapVals(chunkStartX, chunkStartZ, heightmapVals);
    const chunkPrefabs = this.prefabGenerator.getPrefabsForChunk(chunkStartX, chunkStartZ, heightmapVals, closestBiomes, caveHeightmapVals, nearestFixedPrefabInfoForChunk);
    //謎だよ
    const treesForChunk = this.treeGenerator.getTreesForChunk(chunkStartX, chunkStartZ, heightmapVals, closestBiomes, caveHeightmapVals, chunkPrefabs, nearestFixedPrefabInfoForChunk);
    const chunkOres = closestBiomes.getOrGenerate(
      chunkStartX + Math.floor(this.chunkSize / 2),
      chunkStartZ + Math.floor(this.chunkSize / 2)
    )[0].biome.oreGenerator.getOreBlocksForChunk(chunkStartX, chunkStartZ);

    const caveDecorations = this.caveDecorationGenerator.getDecorationsForChunkColumn(chunkStartX, chunkStartZ, heightmapVals, caveHeightmapVals);

    const chunkColumnInfo = {
      biomeInfos: this.biomeSelector.getBiomeInfoForChunkFill(chunkStartX, chunkStartZ, closestBiomes),
      heightmapVals: heightmapVals.viewJustInnerChunk(),
      caveHeightmapVals: caveHeightmapVals.viewJustInnerChunk(),
      treesForChunk,
      chunkPrefabs,
      chunkOres,
      nearestFixedPrefabInfoForChunk,
      decodedFixedPointPrefabsForChunk,
      caveDecorations
    };

    this.mostRecentlyAccessedChunkColumnPos[0] = chunkStartX;
    this.mostRecentlyAccessedChunkColumnPos[1] = chunkStartZ;
    this.mostRecentlyAccessedChunkColumn = chunkColumnInfo;
    this.chunkColumnInfos.set(chunkColumnKey, chunkColumnInfo);

    return chunkColumnInfo;
  }

  getClosestBiomesForChunk(
    chunkStartX: number,
    chunkStartZ: number
  ) {
    return ChunkGeneratorCache.create(this.chunkSize, [chunkStartX, chunkStartZ], this.biomeSelector);
  }

  getHeightMapVals(
    chunkStartX: number,
    chunkStartZ: number,
    closestBiomes: any,
    nearestFixedPrefabInfoForChunk: any
  ) {
    const heightmapGenerator = new HeightmapGenerator(
      closestBiomes,
      nearestFixedPrefabInfoForChunk,
      this.noWaterHeightmapGenerator,
      this.heightmapPerturb,
      this.waterBodyGenerator,
      this.heightOverrideLayer
    );

    return ChunkDataCache3D.create(this.chunkSize, [chunkStartX, chunkStartZ], HeightField.NumFields, heightmapGenerator);
  }
}